import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Look up user in electionverify_nextjs
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: `This account is configured for ${user.authProvider || "social"} sign-in. Please use that method.`,
        },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

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
    const msg = error instanceof Error ? error.message : "Internal login error";
    console.error("[NextJS-App Login Error]:", error);
    return NextResponse.json(
      { success: false, error: `Login failed: ${msg}` },
      { status: 500 }
    );
  }
}
