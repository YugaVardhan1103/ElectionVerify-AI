import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { UserProfile } from "@/types";

interface GoogleProfile {
  email: string;
  name: string;
  picture: string | null;
  id: string;
  verified: boolean;
}

/**
 * Verify Google ID Token or Access Token directly with Google APIs.
 */
async function verifyGoogleToken({
  idToken,
  accessToken,
  token,
}: {
  idToken?: string;
  accessToken?: string;
  token?: string;
}): Promise<GoogleProfile | null> {
  const rawToken = idToken || token || accessToken;
  if (!rawToken) return null;

  // 1. Try Google tokeninfo (for JWT ID tokens from GIS / Google OAuth)
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawToken)}`
    );
    if (res.ok) {
      const info = await res.json();
      if (info.email) {
        return {
          email: info.email.toLowerCase(),
          name: info.name || info.email.split("@")[0],
          picture: info.picture || null,
          id: info.sub,
          verified: info.email_verified === "true" || info.email_verified === true,
        };
      }
    }
  } catch {
    // Continue to userinfo fallback
  }

  // 2. Try Google userinfo (for OAuth 2.0 Bearer access tokens)
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${rawToken}` },
    });
    if (res.ok) {
      const info = await res.json();
      if (info.email) {
        return {
          email: info.email.toLowerCase(),
          name: info.name || info.email.split("@")[0],
          picture: info.picture || null,
          id: info.sub,
          verified: info.email_verified === true,
        };
      }
    }
  } catch {
    // Token verification failed
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, accessToken, token } = body;

    if (!idToken && !accessToken && !token) {
      return NextResponse.json(
        {
          success: false,
          error: "Google authentication requires an idToken or accessToken.",
        },
        { status: 400 }
      );
    }

    // 1. Verify Google token directly with Google OAuth servers
    const profile = await verifyGoogleToken({ idToken, accessToken, token });

    if (!profile || !profile.email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Google credentials or token has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    if (!profile.verified) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your Google account email has not been verified. Please verify your email with Google first.",
        },
        { status: 403 }
      );
    }

    // 2. Prisma / MongoDB User Persistence
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      // Update existing user record with provider info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: user.authProvider === "local" ? "google" : user.authProvider,
          providerId: user.providerId || profile.id,
          avatarUrl: user.avatarUrl || profile.picture,
        },
      });
    } else {
      // Create new authenticated user in MongoDB
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          authProvider: "google",
          providerId: profile.id,
          avatarUrl: profile.picture,
          role: "user",
          accountStatus: "Active",
          preferences: {
            preferredLanguage: "English",
            theme: "System",
            notifications: {
              emailNotifications: true,
              resultNotifications: true,
              announcementNotifications: false,
            },
          },
        },
      });
    }

    // 3. Issue Session JWT
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "electionverify-default-jwt-secret-key-change-in-production";

    const sessionToken = signJwt(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret
    );

    const formattedUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as "user" | "reviewer" | "admin") || "user",
      accountStatus: user.accountStatus || "Active",
      avatarUrl: user.avatarUrl || null,
      authProvider: user.authProvider || "google",
      joinedDate: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
      preferences: {
        preferredLanguage: user.preferences?.preferredLanguage || "English",
        theme:
          (user.preferences?.theme as "Light" | "Dark" | "System") || "System",
        notifications: {
          emailNotifications:
            user.preferences?.notifications?.emailNotifications ?? true,
          resultNotifications:
            user.preferences?.notifications?.resultNotifications ?? true,
          announcementNotifications:
            user.preferences?.notifications?.announcementNotifications ?? false,
        },
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: "Google authentication successful.",
        data: {
          user: formattedUser,
          token: sessionToken,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Auth API] Google authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          err?.message ||
          "Google authentication failed. Please check database connectivity and configuration.",
      },
      { status: 500 }
    );
  }
}
