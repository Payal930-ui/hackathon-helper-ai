import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useLocation } from "wouter";
import { generateProjectData } from "@/lib/api";
import { CORE_OUTPUTS, ALL_OUTPUTS } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Sparkles, AlertCircle, Zap, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const LOADING_MESSAGES = [
  "Analyzing your idea with DeepSeek AI...",
  "Crafting your project roadmap...",
  "Selecting the perfect tech stack...",
  "Planning your hackathon timeline...",
  "Scoring your project potential...",
  "Putting it all together...",
];

const DURATIONS = [
  { id: "8h", label: "8 Hours", sublabel: "Sprint", icon: "⚡" },
  { id: "24h", label: "24 Hours", sublabel: "Classic", icon: "🔥" },
  { id: "3d", label: "3 Days", sublabel: "Extended", icon: "💪" },
  { id: "1w", label: "1 Week", sublabel: "Deep Dive", icon: "🚀" },
];

export default function CreateProjectPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [duration, setDuration] = useState<"8h" | "24h" | "3d" | "1w">("24h");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!title.trim()) { setError("Please enter a project title."); return; }
    if (description.trim().length < 20) { setError("Please describe your project in more detail (at least 20 characters)."); return; }

    setError("");
    setLoading(true);

    try {
      const results = await generateProjectData(title.trim(), description.trim(), CORE_OUTPUTS, teamSize, duration);

      const projectData = {
        userId: user!.uid,
        title: title.trim(),
        description: description.trim(),
        selectedOutputs: ALL_OUTPUTS,
        generatedResults: results,
        teamSize,
        duration,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      toast.success("Project generated!");
      navigate(`/project/${docRef.id}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as Error).message || "Generation failed. Please try again.";
      setError(msg);
      toast.error("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            <Sparkles size={12} /> AI-Powered · DeepSeek
          </div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white">New Project</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Describe your idea — AI generates your roadmap, tech stack, and timeline instantly.</p>
        </div>

        <div className="space-y-5">
          {/* Project details */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div>
              <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Project Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI-Powered Mental Health Companion"
                disabled={loading}
                className="py-4 text-base font-bold rounded-xl dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does it solve? Who are the users? What are the key features? Be specific — better descriptions lead to better AI outputs."
                rows={5}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none text-sm leading-relaxed"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-[10px] font-bold ${description.length < 20 ? "text-gray-300 dark:text-gray-700" : "text-green-500"}`}>
                  {description.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Team & Duration */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Team size */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                  <Users size={12} /> Team Size
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTeamSize(n)}
                      disabled={loading}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                        teamSize === n
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                  <Clock size={12} /> Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id as typeof duration)}
                      disabled={loading}
                      className={`py-3 px-2 rounded-xl font-bold text-sm transition-all text-left pl-3 ${
                        duration === d.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="text-base leading-none mb-0.5">{d.icon}</div>
                      <div className="font-black text-xs">{d.label}</div>
                      <div className={`text-[10px] ${duration === d.id ? "opacity-75" : "text-gray-400"}`}>{d.sublabel}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What gets generated note */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Zap size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">What gets generated instantly</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                Project Plan · Tech Stack · Timeline · AI Score — then generate more sections on-demand from the project view.
              </p>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/10 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 dark:border-red-900/30"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white text-base font-black rounded-3xl transition-all shadow-2xl shadow-blue-500/25 disabled:opacity-75"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating with AI...</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingMsgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-medium opacity-75"
                  >
                    {LOADING_MESSAGES[loadingMsgIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Project with AI
              </div>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
