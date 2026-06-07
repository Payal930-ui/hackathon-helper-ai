"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let message = "Failed to send reset email. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many requests. Please try again later.";
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We'll send you a link to get back into your account
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-600 w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="font-bold dark:text-white text-lg">Email Sent!</p>
              <p className="text-sm text-gray-500">Check your inbox at <span className="font-bold text-gray-700 dark:text-gray-300">{email}</span> and follow the instructions to reset your password.</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full rounded-xl py-6 mt-4">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleReset}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="email" 
                  required 
                  placeholder="john@example.com" 
                  className="pl-10 dark:bg-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
