import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required." },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired authorization token." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: formatUserProfile(user),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Session error";
    console.error("[NextJS-App Me Route Error]:", error);
    return NextResponse.json(
      { success: false, error: `Authentication failed: ${msg}` },
      { status: 500 }
    );
  }
}
