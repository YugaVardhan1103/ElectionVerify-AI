import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme.js";
import { useAuth } from "../context/useAuth.js";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  simulatePasswordUpdate,
} from "../services/profileService.js";
import { SUPPORTED_LANGUAGES } from "../data/mockData.js";
import { validateName, validateEmail } from "../utils/validators.js";

/**
 * ElectionVerify AI - User Profile & Account Preferences Page
 *
 * Provides personal information editing, simulated credential management,
 * notification settings, language preferences, and theme controls.
 * Fully backed by profileService and themeContext.
 */
function Profile() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  // Profile state from service
  const [profile, setProfile] = useState(() => ({
    name: "User",
    email: "",
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
  }));
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Personal Info Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    resultNotifications: true,
    announcementNotifications: false,
  });
  const [prefNotice, setPrefNotice] = useState("");

  // Language & Theme
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [accountPrefNotice, setAccountPrefNotice] = useState("");

  // Logout modal
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Load profile from API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const p = await getProfile();
        if (isMounted && p) {
          setProfile(p);
          setEditName(p.name || "");
          setEditEmail(p.email || "");
          if (p.preferences) {
            setPreferredLanguage(p.preferences.preferredLanguage || "English");
            if (p.preferences.notifications) {
              setNotifications(p.preferences.notifications);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load profile:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close logout modal on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && showLogoutConfirmation) {
        setShowLogoutConfirmation(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirmation]);

  // Compute initials dynamically
  function getInitials(fullName) {
    if (!fullName || typeof fullName !== "string") return "DU";
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "DU";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Handle personal info save
  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const nameVal = validateName(editName);
    if (!nameVal.isValid) {
      setProfileError(nameVal.error);
      return;
    }

    const emailVal = validateEmail(editEmail);
    if (!emailVal.isValid) {
      setProfileError(emailVal.error);
      return;
    }

    const res = await updateProfile({ name: editName, email: editEmail });
    if (res.success && res.profile) {
      setProfile(res.profile);
      setIsEditing(false);
      setProfileSuccess(res.message || "Personal information updated successfully.");
    } else {
      setProfileError(res.error || "Failed to update profile.");
    }
  }

  function handleCancelEdit() {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setProfileError("");
    setIsEditing(false);
  }

  // Handle password update
  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const res = await simulatePasswordUpdate({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    // Clear password inputs regardless of outcome (never retain credentials)
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (res.success) {
      setPasswordSuccess(res.message || "Password updated successfully.");
    } else {
      setPasswordError(res.error || "Password update failed.");
    }
  }

  // Handle notification preferences save
  async function handleSaveNotifications() {
    setPrefNotice("");
    const res = await updatePreferences({ notifications });
    if (res.success) {
      const refreshed = await getProfile();
      setProfile(refreshed);
      setPrefNotice("Notification preferences updated successfully.");
    } else {
      setPrefNotice(res.error || "Could not update notification settings.");
    }
  }

  // Handle account preferences save (Language & Theme)
  async function handleSaveAccountPrefs() {
    setAccountPrefNotice("");
    const res = await updatePreferences({
      preferredLanguage,
      theme,
    });
    if (res.success) {
      const refreshed = await getProfile();
      setProfile(refreshed);
      setAccountPrefNotice("Account preferences updated successfully.");
    } else {
      setAccountPrefNotice(res.error || "Failed to update account preferences.");
    }
  }

  async function handleLogout() {
    setShowLogoutConfirmation(false);
    await logout();
    navigate("/");
  }

  if (isLoadingProfile) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile &amp; Settings</h1>
          <p className="mt-2 text-text-secondary">
            Manage your personal details, credentials, notifications, and theme preferences.
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Dynamic Initials or Real OAuth Profile Photo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-2 ring-border shadow-sm dark:bg-brand-950 dark:text-brand-300">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                getInitials(profile.name)
              )}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-text-primary">
                {profile.name}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {profile.email}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {profile.role || "Registered User"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Account: {profile.accountStatus || "Active"}
                </span>
                {profile.authProvider && profile.authProvider !== "local" && (
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              Personal Information
            </h2>
            {!isEditing ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </div>

          {profileSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
              {profileError}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  label="Full Name"
                  type="text"
                  name="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  name="editEmail"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-text-secondary">Full Name</p>
                <p className="mt-1 font-medium text-text-primary">
                  {profile.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Email Address</p>
                <p className="mt-1 font-medium text-text-primary">
                  {profile.email}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Change Password (Simulation) */}
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Change Password
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Simulate updating your account credentials. Passwords are validated according to platform rules and never saved.
            </p>
          </div>

          {passwordSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4" noValidate>
            <div>
              <FormInput
                label="Current Password"
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormInput
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  helperText="8+ characters with uppercase, lowercase &amp; digit"
                  required
                />
              </div>

              <div>
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <h2 className="text-xl font-bold text-text-primary">
            Notification Preferences
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Configure how you wish to receive simulated platform updates.
          </p>

          {prefNotice && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {prefNotice}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div>
                <p className="font-medium text-text-primary text-sm">
                  Email Notifications
                </p>
                <p className="text-xs text-text-secondary">
                  Receive email notifications about verified claims.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    emailNotifications: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div>
                <p className="font-medium text-text-primary text-sm">
                  Verification Result Alerts
                </p>
                <p className="text-xs text-text-secondary">
                  Notify when pending claims under review complete verification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.resultNotifications}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    resultNotifications: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div>
                <p className="font-medium text-text-primary text-sm">
                  Platform Announcements
                </p>
                <p className="text-xs text-text-secondary">
                  Receive news about new verification features and election milestones.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.announcementNotifications}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    announcementNotifications: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveNotifications}
            >
              Save Notification Preferences
            </Button>
          </div>
        </Card>

        {/* Account Preferences (Language & Theme) */}
        <Card>
          <h2 className="text-xl font-bold text-text-primary">
            Account Preferences
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Customize language and visual theme display.
          </p>

          {accountPrefNotice && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {accountPrefNotice}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-language"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Preferred Language
              </label>
              <select
                id="profile-language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-theme"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Theme Preference
              </label>
              <select
                id="profile-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Light">Light Mode</option>
                <option value="Dark">Dark Mode</option>
                <option value="System">System Preference</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAccountPrefs}
            >
              Save Preferences
            </Button>
          </div>
        </Card>

        {/* Logout Section */}
        <Card className="border-red-200 dark:border-rose-900/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Session Sign Out
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                Sign out of your account on this device.
              </p>
            </div>

            <Button
              type="button"
              variant="danger"
              onClick={() => setShowLogoutConfirmation(true)}
            >
              Log Out
            </Button>
          </div>
        </Card>

        {/* Accessible Logout Confirmation Modal */}
        {showLogoutConfirmation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowLogoutConfirmation(false);
              }
            }}
          >
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
              <h3
                id="logout-modal-title"
                className="text-lg font-bold text-text-primary"
              >
                Confirm Sign Out
              </h3>

              <p className="mt-3 text-sm text-text-secondary">
                Are you sure you want to sign out of your account?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLogoutConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Confirm Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
