import { useState } from "react";
import { useTheme } from "../context/useTheme.js";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";

function Profile() {
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(
    () => localStorage.getItem("profileName") || "User Name"
    );

    const [email, setEmail] = useState(
    () => localStorage.getItem("profileEmail") || "user@example.com"
    );

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    
    const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem("emailNotifications") !== "false"
    );

    const [resultNotifications, setResultNotifications] = useState(
    () => localStorage.getItem("resultNotifications") !== "false"
    );

    const [announcementNotifications, setAnnouncementNotifications] = useState(
    () => localStorage.getItem("announcementNotifications") === "true"
    );

    const [preferredLanguage, setPreferredLanguage] = useState(
    () => localStorage.getItem("preferredLanguage") || "English"
    );

    const { theme, setTheme } = useTheme();

    const navigate = useNavigate();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    function handleLogout() {
    setShowLogoutConfirmation(false);
    navigate("/login");
    }

    function handlePasswordUpdate(e) {
        e.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("New password must contain at least 8 characters.");
            return;
        }

        if (!/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword)) {
            setPasswordError(
            "Password must contain uppercase, lowercase and a number."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        setPasswordSuccess("Password validation successful!");
    }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="mt-2 text-text-secondary">
          View and manage your personal information.
        </p>

        {/* Profile Overview */}
        <div className="card mt-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row">

            {/* Profile Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            YV
            </div>

            {/* User Information */}
            <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">
                User Name
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
                user@example.com
            </p>

            <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Registered User
            </span>
            </div>

        </div>
        </div>

        {/* Personal Information */}
        <div className="card mt-6">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
            Personal Information
            </h2>

            <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary text-sm"
            >
            {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>

        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div>
                {isEditing ? (
                    <FormInput
                    label="Full Name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    />
                ) : (
                    <>
                    <p className="text-sm text-text-secondary">
                        Full Name
                    </p>

                    <p className="mt-2 font-medium">
                        {name}
                    </p>
                    </>
                )}
            </div>

            <div>
                {isEditing ? (
                    <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    />
                ) : (
                    <>
                    <p className="text-sm text-text-secondary">
                        Email Address
                    </p>

                    <p className="mt-2 font-medium">
                        {email}
                    </p>
                    </>
                )}
            </div>

            <div>
            <p className="text-sm text-text-secondary">
                Account Type
            </p>
            <p className="mt-2 font-medium">
                Registered User
            </p>
            </div>

            <div>
            <p className="text-sm text-text-secondary">
                Account Status
            </p>
            <p className="mt-2 font-medium text-success">
                Active
            </p>
            </div>

        </div>

        {isEditing && (
        <div className="mt-6 flex justify-end">
            <button
            type="button"
            onClick={() => {
            localStorage.setItem("profileName", name);
            localStorage.setItem("profileEmail", email);
            setIsEditing(false);
            }}
            className="btn-primary"
            >
            Save Changes
            </button>
        </div>
        )}

        </div>

        <div className="card mt-8">
        <h2 className="text-xl font-bold">
            Change Password
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            Update your password to keep your account secure.
        </p>

        <form
        className="mt-6 space-y-5"
        onSubmit={handlePasswordUpdate}
        noValidate
        >
            <div>
            <label className="mb-2 block text-sm font-medium">
                Current Password
            </label>
            <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
            />
            </div>

            <div>
            <label className="mb-2 block text-sm font-medium">
                New Password
            </label>
            <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
            />
            </div>

            <div>
            <label className="mb-2 block text-sm font-medium">
                Confirm New Password
            </label>
            <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
            />
            </div>

            {passwordError && (
            <p className="text-sm text-red-600">
                {passwordError}
            </p>
            )}

            {passwordSuccess && (
            <p className="text-sm text-green-600">
                {passwordSuccess}
            </p>
            )}

            <div className="flex justify-end">
            <button type="submit" className="btn-primary">
                Update Password
            </button>
            </div>
        </form>
        </div>

        <div className="card mt-8">
        <h2 className="text-xl font-bold">
            Notification Settings
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            Manage the notifications you want to receive.
        </p>

        <div className="mt-6 space-y-5">

            <label className="flex items-center justify-between gap-4">
            <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-text-secondary">
                Receive important updates through email.
                </p>
            </div>

            <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
            />
            </label>

            <label className="flex items-center justify-between gap-4">
            <div>
                <p className="font-medium">Verification Updates</p>
                <p className="text-sm text-text-secondary">
                Get notified when your claim verification is completed.
                </p>
            </div>

            <input
                type="checkbox"
                checked={resultNotifications}
                onChange={(e) => setResultNotifications(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
            />
            </label>

            <label className="flex items-center justify-between gap-4">
            <div>
                <p className="font-medium">Platform Announcements</p>
                <p className="text-sm text-text-secondary">
                Receive news about new features and platform updates.
                </p>
            </div>

            <input
                type="checkbox"
                checked={announcementNotifications}
                onChange={(e) => setAnnouncementNotifications(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
            />
            </label>

        </div>

        <div className="mt-6 flex justify-end">
        <button
            type="button"
            onClick={() => {
            localStorage.setItem(
                "emailNotifications",
                emailNotifications
            );

            localStorage.setItem(
                "resultNotifications",
                resultNotifications
            );

            localStorage.setItem(
                "announcementNotifications",
                announcementNotifications
            );
            }}
            className="btn-primary"
        >
            Save Preferences
        </button>
        </div>

        </div>

        <div className="card mt-8">
        <h2 className="text-xl font-bold">
            Account Preferences
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            Customize your platform experience.
        </p>

        <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
            Preferred Language
            </label>

            <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand-600"
            >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            </select>
        </div>

        <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
            Theme Preference
        </label>

        <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand-600"
        >
        <option value="Light">Light Mode</option>
        <option value="Dark">Dark Mode</option>
        </select>
        </div>

        <div className="mt-6 flex justify-end">
            <button
            type="button"
            onClick={() => {
            localStorage.setItem("preferredLanguage", preferredLanguage);
            }}
            className="btn-primary"
            >
            Save Preferences
            </button>
        </div>
        </div>

        <div className="card mt-8">
        <h2 className="text-xl font-bold">
            Logout
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            Sign out of your ElectionVerify AI account.
        </p>

        <div className="mt-6 flex justify-end">
            <button
            type="button"
            onClick={() => setShowLogoutConfirmation(true)}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
            >
            Logout
            </button>
        </div>
        </div>

        {showLogoutConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">

            <h2 className="text-xl font-bold text-text-primary">
                Confirm Logout
            </h2>

            <p className="mt-3 text-sm text-text-secondary">
                Are you sure you want to log out of your account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
                <button
                type="button"
                onClick={() => setShowLogoutConfirmation(false)}
                className="btn-secondary"
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
                >
                Confirm Logout
                </button>
            </div>

            </div>
        </div>
        )}

      </div>

    </main>
  );
}

export default Profile;