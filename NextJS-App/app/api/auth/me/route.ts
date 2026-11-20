import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { UserProfile } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "electionverify-default-jwt-secret-key-change-in-production";

    const decoded = verifyJwt<{ id: string; email: string; role: string }>(
      token,
      jwtSecret
    );

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    const formattedUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as "user" | "reviewer" | "admin") || "user",
      accountStatus: user.accountStatus || "Active",
      avatarUrl: user.avatarUrl || null,
      authProvider: user.authProvider || "local",
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
        data: { user: formattedUser },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Auth API] /me error:", error);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
