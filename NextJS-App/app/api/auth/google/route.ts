import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { UserProfile } from "@/types";

function formatUserProfile(user: {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  accountStatus?: string | null;
  avatarUrl?: string | null;
  authProvider?: string | null;
  createdAt?: Date;
  preferences?: {
    preferredLanguage?: string;
    theme?: string;
    notifications?: {
      emailNotifications?: boolean;
      resultNotifications?: boolean;
      announcementNotifications?: boolean;
    } | null;
  } | null;
}): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role || "user") as "user" | "reviewer" | "admin",
    accountStatus: user.accountStatus || "Active",
    avatarUrl: user.avatarUrl || null,
    authProvider: user.authProvider || "local",
    joinedDate: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    preferences: {
      preferredLanguage: user.preferences?.preferredLanguage || "English",
      theme: (user.preferences?.theme || "System") as "Light" | "Dark" | "System",
      notifications: {
        emailNotifications: user.preferences?.notifications?.emailNotifications ?? true,
        resultNotifications: user.preferences?.notifications?.resultNotifications ?? true,
        announcementNotifications: user.preferences?.notifications?.announcementNotifications ?? false,
      },
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accessToken, idToken } = body;

    let googleProfile: {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    } | null = null;

    // 1. Verify with Google UserInfo endpoint using accessToken
    if (accessToken) {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userInfoRes.ok) {
        googleProfile = await userInfoRes.json();
      }
    }

    // 2. Fallback: Verify with tokeninfo using idToken if accessToken didn't succeed
    if (!googleProfile && idToken) {
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (tokenInfoRes.ok) {
        googleProfile = await tokenInfoRes.json();
      }
    }

    if (!googleProfile || !googleProfile.email) {
      return NextResponse.json(
        { success: false, error: "Google authentication failed: unable to verify identity with Google." },
        { status: 401 }
      );
    }

    const normalizedEmail = googleProfile.email.toLowerCase();

    // Persist or update user in electionverify_nextjs via Prisma
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: googleProfile.name || undefined,
        avatarUrl: googleProfile.picture || undefined,
        authProvider: "google",
        providerId: googleProfile.sub,
      },
      create: {
        name: googleProfile.name || "Google User",
        email: normalizedEmail,
        role: "user",
        accountStatus: "Active",
        authProvider: "google",
        providerId: googleProfile.sub,
        avatarUrl: googleProfile.picture || null,
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: formatUserProfile(user),
      token,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Google auth error";
    console.error("[NextJS-App Google Auth Error]:", error);
    return NextResponse.json(
      { success: false, error: `Google authentication failed: ${msg}` },
      { status: 500 }
    );
  }
}
