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
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in electionverify_nextjs
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persist new user in electionverify_nextjs
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        accountStatus: "Active",
        authProvider: "local",
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
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        user: formatUserProfile(newUser),
        token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal registration error";
    console.error("[NextJS-App Register Error]:", error);
    return NextResponse.json(
      { success: false, error: `Registration failed: ${msg}` },
      { status: 500 }
    );
  }
}
