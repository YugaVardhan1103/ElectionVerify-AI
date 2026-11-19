"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import Button from "@/components/Button";
import FormInput from "@/components/FormInput";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";
import { SUPPORTED_LANGUAGES } from "@/constants/verdicts";
import { validateName, validateEmail } from "@/lib/validators";
import { UserProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    resultNotifications: true,
    announcementNotifications: false,
  });
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [prefMessage, setPrefMessage] = useState("");

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const p = await userApi.getProfile();
      setProfile(p);
      setName(p.name);
      setEmail(p.email);
      if (p.preferences) {
        setPreferredLanguage(p.preferences.preferredLanguage || "English");
        if (p.preferences.notifications) {
          setNotifications(p.preferences.notifications);
        }
      }
    }
    loadProfile();
  }, []);

  function getInitials(fullName: string) {
    if (!fullName) return "DU";
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "DU";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");

    const nameVal = validateName(name);
    if (!nameVal.isValid) return setProfileError(nameVal.error);

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) return setProfileError(emailVal.error);

    const res = await userApi.updateProfile({ name, email });
    if (res.success && res.profile) {
      setProfile(res.profile);
      setIsEditing(false);
      setProfileMessage("Profile updated successfully.");
    } else {
      setProfileError("Could not update profile.");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPasswordError("Please fill out all password fields.");
    }
    if (newPassword !== confirmPassword) {
      return setPasswordError("New passwords do not match.");
    }

    const res = await userApi.updatePassword({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (res.success) {
      setPasswordMessage("Password validated and updated successfully.");
    } else {
      setPasswordError(res.error || "Password update failed.");
    }
  };

  const handleSavePreferences = async () => {
    setPrefMessage("");
    const res = await userApi.updatePreferences({
      preferredLanguage,
      theme,
      notifications,
    });
    if (res.success) {
      setPrefMessage("Preferences saved successfully.");
    } else {
      setPrefMessage("Preferences updated in client session.");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Account &amp; Preferences
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Manage your personal information, notification settings, and visual theme display.
            </p>
          </div>

          {/* User Overview Card */}
          <Card>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-2 ring-border shadow-sm dark:bg-brand-950 dark:text-brand-300">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name || name}
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(profile?.name || name)
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-text-primary">
                  {profile?.name || name || "User Profile"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {profile?.email || email}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Role: {profile?.role || "user"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Status: {profile?.accountStatus || "Active"}
                  </span>
                  {profile?.authProvider && profile.authProvider !== "local" && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {profile.authProvider} Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Personal Information
              </h2>
              {!isEditing ? (
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>

            {profileMessage && (
              <div className="mb-4 rounded bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {profileMessage}
              </div>
            )}
            {profileError && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
                {profileError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-text-secondary">Full Name</p>
                  <p className="font-medium text-text-primary mt-1">{profile?.name || name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Email Address</p>
                  <p className="font-medium text-text-primary mt-1">{profile?.email || email}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Change Password */}
          <Card>
            <h2 className="text-lg font-bold text-text-primary">Change Password</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Passwords are salted and securely hashed before database persistence.
            </p>

            {passwordMessage && (
              <div className="mt-3 rounded bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="mt-3 rounded bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4" noValidate>
              <FormInput
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="8+ chars with uppercase, lowercase &amp; digit"
                  required
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm">
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Preferences */}
          <Card>
            <h2 className="text-lg font-bold text-text-primary">
              Interface &amp; Notifications
            </h2>

            {prefMessage && (
              <div className="mt-3 rounded bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {prefMessage}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-language"
                  className="mb-1 block text-xs font-semibold text-text-primary"
                >
                  Preferred Language
                </label>
                <select
                  id="profile-language"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-theme"
                  className="mb-1 block text-xs font-semibold text-text-primary"
                >
                  Theme Preference
                </label>
                <select
                  id="profile-theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "Light" | "Dark" | "System")}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Light">Light Mode</option>
                  <option value="Dark">Dark Mode</option>
                  <option value="System">System Default</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                  <p className="text-xs text-text-secondary">Receive alerts for verified claims</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) =>
                    setNotifications((p) => ({ ...p, emailNotifications: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <p className="text-sm font-medium text-text-primary">Verification Alerts</p>
                  <p className="text-xs text-text-secondary">
                    Notify when claims under review complete analysis
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.resultNotifications}
                  onChange={(e) =>
                    setNotifications((p) => ({ ...p, resultNotifications: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePreferences} size="sm">
                Save Preferences
              </Button>
            </div>
          </Card>

          {/* Session Logout */}
          <Card className="border-red-200 dark:border-rose-900/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary">Session Sign Out</h2>
                <p className="text-xs text-text-secondary">
                  End your current authenticated session.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowLogoutModal(true)}>
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Modal */}
          {showLogoutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
              role="dialog"
              aria-modal="true"
            >
              <div className="card w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-text-primary">Confirm Sign Out</h3>
                <p className="mt-2 text-xs text-text-secondary">
                  Are you sure you want to log out of your ElectionVerify AI account?
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setShowLogoutModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleLogout}>
                    Confirm Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
