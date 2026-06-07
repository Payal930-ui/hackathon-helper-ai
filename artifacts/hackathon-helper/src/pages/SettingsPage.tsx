import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sun, Moon, Loader2, CheckCircle2, Shield, Bell, Palette } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, userData, refreshUserData } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(userData?.name || "");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), { name });
      await refreshUserData();
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPassLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/wrong-password") toast.error("Current password is incorrect");
      else toast.error("Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to send verification email");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white">Settings</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your account preferences</p>
        </div>

        <SettingsSection icon={<Palette size={18} />} title="Profile">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Display Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="dark:bg-gray-800" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Email Address</label>
              <Input value={userData?.email || user?.email || ""} disabled className="dark:bg-gray-800 opacity-60 cursor-not-allowed" />
            </div>
            {user && !user.emailVerified && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                <Shield className="text-yellow-600 w-5 h-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Email not verified</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">Verify your email to unlock all features</p>
                </div>
                <Button size="sm" variant="outline" onClick={handleVerifyEmail} className="shrink-0 text-yellow-600 border-yellow-200 dark:border-yellow-900/30">
                  Verify
                </Button>
              </div>
            )}
            <Button onClick={handleUpdateProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection icon={<Sun size={18} />} title="Appearance">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your theme preference is synced across all devices.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-800 hover:border-gray-200"}`}
              >
                <Sun className={`w-5 h-5 ${theme === "light" ? "text-blue-600" : "text-gray-400"}`} />
                <span className={`font-bold text-sm ${theme === "light" ? "text-blue-600" : "text-gray-500"}`}>Light Mode</span>
                {theme === "light" && <CheckCircle2 size={16} className="text-blue-600 ml-auto" />}
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-800 hover:border-gray-200"}`}
              >
                <Moon className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-gray-400"}`} />
                <span className={`font-bold text-sm ${theme === "dark" ? "text-blue-400" : "text-gray-500"}`}>Dark Mode</span>
                {theme === "dark" && <CheckCircle2 size={16} className="text-blue-400 ml-auto" />}
              </button>
            </div>
          </div>
        </SettingsSection>

        {user?.providerData[0]?.providerId === "password" && (
          <SettingsSection icon={<Shield size={18} />} title="Security">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Current Password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="dark:bg-gray-800" />
              </div>
              <Button onClick={handleChangePassword} disabled={passLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold">
                {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </SettingsSection>
        )}
      </div>
    </DashboardLayout>
  );
}

function SettingsSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">{icon}</div>
        <h2 className="text-lg font-black dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
