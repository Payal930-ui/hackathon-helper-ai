"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Camera, Mail, Shield, Save, Loader2, Award } from "lucide-react";
import toast from "react-hot-toast";
import { ACHIEVEMENTS } from "@/lib/types";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, userData, refreshUserData } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (userData?.name) setName(userData.name);
  }, [userData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
      await refreshUserData();
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setLoading(true);

    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      toast.success("Password updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account and view achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg mx-auto">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                  <Camera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold dark:text-white">{userData?.name}</h2>
              <p className="text-sm text-gray-500">{userData?.email}</p>
              
              <div className="mt-6 flex justify-center gap-2">
                {userData?.badges?.map((badgeId) => {
                  const badge = ACHIEVEMENTS.find(a => a.id === badgeId);
                  return badge ? (
                    <div key={badgeId} className="group relative">
                      <div className="text-2xl cursor-help p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {badge.icon}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {badge.name}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
                <Award size={18} className="text-blue-600" />
                Achievements
              </h3>
              <div className="space-y-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = userData?.badges?.includes(achievement.id);
                  return (
                    <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isUnlocked ? "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30" : "border-gray-50 dark:border-gray-800 opacity-50"}`}>
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{achievement.name}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="md:col-span-2 space-y-6">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <User size={20} className="text-blue-600" />
                Personal Information
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input value={userData?.email || ""} disabled className="pl-10 bg-gray-50 dark:bg-gray-950 opacity-50 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <Shield size={20} className="text-blue-600" />
                Security Settings
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Enter new password"
                    className="dark:bg-gray-800"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="outline" disabled={loading || !newPassword}>
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
