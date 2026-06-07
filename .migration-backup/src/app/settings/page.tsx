"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { User, Moon, Sun, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, userData, refreshUserData } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.name) setName(userData.name);
    if (userData?.email) setEmail(userData.email);
  }, [userData?.name, userData?.email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), { name });
      await refreshUserData();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="glass-card p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-900 dark:text-white">
                <User className="w-5 h-5 text-blue-600" />
                <span>Personal Information</span>
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed outline-none"
                    value={email}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </section>

            <section className="glass-card p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-900 dark:text-white">
                {theme === "light" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
                <span>Appearance</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    theme === "light"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800"
                  }`}
                >
                  <Sun className={`w-8 h-8 mb-2 ${theme === "light" ? "text-blue-600" : "text-gray-400"}`} />
                  <span className={`font-medium ${theme === "light" ? "text-blue-600" : "text-gray-600"}`}>Light Mode</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    theme === "dark"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800"
                  }`}
                >
                  <Moon className={`w-8 h-8 mb-2 ${theme === "dark" ? "text-blue-400" : "text-gray-400"}`} />
                  <span className={`font-medium ${theme === "dark" ? "text-blue-400" : "text-gray-400"}`}>Dark Mode</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
