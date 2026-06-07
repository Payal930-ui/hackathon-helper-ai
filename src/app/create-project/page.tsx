"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Code,
  Layout,
  Database,
  Presentation,
  Cloud,
  ClipboardList,
  Star,
  Users,
  Clock,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { OutputKey } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, name: "Project Info" },
  { id: 2, name: "Output Selection" },
  { id: 3, name: "Generating" },
];

const OUTPUT_OPTIONS: { id: OutputKey; label: string; icon: any; color: string }[] = [
  { id: "projectPlan", label: "Project Plan", icon: ClipboardList, color: "text-blue-600" },
  { id: "techStack", label: "Tech Stack", icon: Code, color: "text-purple-600" },
  { id: "databaseSchema", label: "Database Schema", icon: Database, color: "text-green-600" },
  { id: "uiDesign", label: "UI Design", icon: Layout, color: "text-pink-600" },
  { id: "codeSnippets", label: "Code Snippets", icon: Code, color: "text-orange-600" },
  { id: "pptContent", label: "PPT Slides", icon: Presentation, color: "text-red-600" },
  { id: "readme", label: "README", icon: FileText, color: "text-indigo-600" },
  { id: "deploymentGuide", label: "Deployment Guide", icon: Cloud, color: "text-cyan-600" },
  { id: "projectScores", label: "AI Score", icon: Star, color: "text-yellow-600" },
  { id: "pitches", label: "Pitch Generator", icon: MessageSquare, color: "text-emerald-600" },
  { id: "teamTasks", label: "Task Distributor", icon: Users, color: "text-violet-600" },
  { id: "timeline", label: "Smart Timeline", icon: Clock, color: "text-amber-600" },
  { id: "validator", label: "AI Validator", icon: ShieldCheck, color: "text-rose-600" },
];

export default function CreateProjectPage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [duration, setDuration] = useState("24h");
  const [selectedOutputs, setSelectedOutputs] = useState<OutputKey[]>(
    OUTPUT_OPTIONS.map((o) => o.id)
  );
  const [loading, setLoading] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState("");

  const toggleOutput = (id: OutputKey) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!title || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    setStep(3);
    setLoading(true);

    try {
      setGeneratingLabel("Brainstorming with Gemini AI...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, selectedOutputs, teamSize, duration }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratingLabel("Finalizing your winning strategy...");
      const docRef = await addDoc(collection(db, "projects"), {
        userId: user?.uid,
        title,
        description,
        teamSize,
        duration,
        selectedOutputs,
        generatedResults: data.generatedResults,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update achievements
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const newBadges = [];
        if (!userData?.badges?.includes("first_project")) newBadges.push("first_project");
        if (selectedOutputs.includes("readme") && !userData?.badges?.includes("readme_master")) newBadges.push("readme_master");
        if (selectedOutputs.includes("pptContent") && !userData?.badges?.includes("ppt_creator")) newBadges.push("ppt_creator");
        
        if (newBadges.length > 0) {
          await updateDoc(userRef, {
            badges: arrayUnion(...newBadges)
          });
          await refreshUserData();
        }
      }

      toast.success("Project generated successfully!");
      router.push(`/project/${docRef.id}`);
    } catch (error) {
      console.error("Error generating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate project. Please try again."
      );
      setStep(2);
    } finally {
      setLoading(false);
      setGeneratingLabel("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-12">
          <div className="flex items-center justify-between px-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-lg ${
                    step >= s.id
                      ? "bg-blue-600 text-white scale-110 shadow-blue-500/30"
                      : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-800"
                  }`}
                >
                  {step > s.id ? <Check className="w-6 h-6" /> : s.id}
                </div>
                <span className={`text-xs mt-3 font-bold uppercase tracking-wider ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-6 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <Lightbulb className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Tell us your project idea</h2>
                  <p className="text-gray-500 dark:text-gray-400">Provide the basics to kickstart the AI brainstorm.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. HealthAI Companion"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Team Size</label>
                      <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setTeamSize(n)}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${teamSize === n ? "bg-white dark:bg-gray-800 text-blue-600 shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Duration</label>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                      >
                        <option value="8h">8 Hours</option>
                        <option value="24h">24 Hours</option>
                        <option value="3d">3 Days</option>
                        <option value="1w">1 Week</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Project Description</label>
                  <textarea
                    rows={8}
                    placeholder="Describe your project, features, target users..."
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!title || !description}
                  className="px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all text-lg"
                >
                  Select Outputs
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Choose Your Outputs</h2>
                  <p className="text-gray-500 dark:text-gray-400">Select what resources you want AI to generate for you.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedOutputs(OUTPUT_OPTIONS.map(o => o.id))} className="rounded-xl font-bold">Select All</Button>
                  <Button variant="ghost" onClick={() => setSelectedOutputs([])} className="rounded-xl font-bold">Clear All</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OUTPUT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedOutputs.includes(option.id);
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleOutput(option.id)}
                      className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10"
                          : "border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200"
                      }`}
                    >
                      <div className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ${option.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <span className={`block font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                          {option.label}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">AI Generated</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200"}`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="px-8 py-6 font-bold text-gray-500 rounded-2xl"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={selectedOutputs.length === 0}
                  className="px-12 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all text-lg"
                >
                  <Rocket className="mr-2 w-6 h-6" />
                  Generate Winning Project
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-3xl border-4 border-blue-50 dark:border-blue-900/20 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-12 h-12 text-blue-600 animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-extrabold dark:text-white">Generating Magic...</h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-xl animate-pulse">{generatingLabel}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-sm mx-auto">
                  Our advanced Gemini AI models are crafting your project plan, tech stack, and pitch to help you win.
                </p>
              </div>

              <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
                {selectedOutputs.slice(0, 8).map((o) => (
                  <div key={o} className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="truncate">{OUTPUT_OPTIONS.find(opt => opt.id === o)?.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
