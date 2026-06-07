import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useLocation } from "wouter";
import { generateProjectData } from "@/lib/gemini";
import type { OutputKey } from "@/lib/types";
import { TAB_LABELS } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Sparkles, Check, AlertCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const OUTPUT_DESCRIPTIONS: Record<OutputKey, string> = {
  projectPlan: "Step-by-step roadmap with phases and milestones",
  techStack: "Recommended technologies with justifications",
  databaseSchema: "Database structure and relationships",
  uiDesign: "Color palette, typography, and UI wireframes",
  codeSnippets: "Ready-to-use code for core features",
  pptContent: "10-slide presentation for judges",
  readme: "Professional README for GitHub",
  deploymentGuide: "Step-by-step deployment instructions",
  projectScores: "AI scoring on 5 key dimensions",
  pitches: "30s, 1min, and 3min elevator pitches",
  teamTasks: "Task distribution based on team size",
  timeline: "Hour-by-hour timeline based on duration",
  validator: "SWOT-style project validation",
};

const DURATIONS = [
  { id: "8h", label: "8 Hours", emoji: "⚡" },
  { id: "24h", label: "24 Hours", emoji: "🔥" },
  { id: "3d", label: "3 Days", emoji: "💪" },
  { id: "1w", label: "1 Week", emoji: "🚀" },
];

const ALL_OUTPUTS: OutputKey[] = [
  "projectScores", "projectPlan", "techStack", "databaseSchema",
  "uiDesign", "codeSnippets", "pptContent", "readme",
  "deploymentGuide", "pitches", "teamTasks", "timeline", "validator"
];

export default function CreateProjectPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [duration, setDuration] = useState<"8h" | "24h" | "3d" | "1w">("24h");
  const [selectedOutputs, setSelectedOutputs] = useState<OutputKey[]>([
    "projectScores", "projectPlan", "techStack", "codeSnippets", "pptContent", "pitches",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleOutput = (key: OutputKey) => {
    setSelectedOutputs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedOutputs(ALL_OUTPUTS);
  };

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please provide a project title and description.");
      return;
    }
    if (selectedOutputs.length === 0) {
      setError("Please select at least one output.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const results = await generateProjectData(title, description, selectedOutputs, teamSize, duration);
      const projectData = {
        userId: user!.uid,
        title,
        description,
        selectedOutputs,
        generatedResults: results,
        teamSize,
        duration,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      toast.success("Project generated successfully!");
      navigate(`/project/${docRef.id}`);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || "Failed to generate project. Please try again.");
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter dark:text-white">Create Project</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Describe your idea and let AI do the heavy lifting</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black dark:text-white uppercase tracking-tight">Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Project Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., AI-Powered Mental Health App" className="py-6 rounded-xl dark:bg-gray-800 text-lg font-bold" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project idea in detail. What problem does it solve? Who are the users? What are the key features?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-black dark:text-white uppercase tracking-tight mb-6">Team & Duration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Team Size</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTeamSize(n)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${teamSize === n ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id as typeof duration)}
                      className={`py-3 rounded-xl font-bold transition-all ${duration === d.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black dark:text-white uppercase tracking-tight">Select Outputs</h2>
              <button onClick={handleSelectAll} className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Select All ({ALL_OUTPUTS.length})
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_OUTPUTS.map((key) => {
                const isSelected = selectedOutputs.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleOutput(key)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"}`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>{TAB_LABELS[key]}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{OUTPUT_DESCRIPTIONS[key]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/10 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-3xl transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Generating Your Project...
              </>
            ) : (
              <>
                <Sparkles className="mr-3 h-6 w-6" />
                Generate Project ({selectedOutputs.length} outputs)
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
