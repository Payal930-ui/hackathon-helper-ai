"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
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
} from "lucide-react";
import { OUTPUT_OPTIONS, type OutputKey } from "@/lib/types";

const STEPS = [
  { id: 1, name: "Project Info" },
  { id: 2, name: "Output Selection" },
  { id: 3, name: "Generating" },
];

const OUTPUT_ICONS: Record<OutputKey, React.ComponentType<{ className?: string }>> = {
  projectPlan: ClipboardList,
  techStack: Code,
  databaseSchema: Database,
  uiDesign: Layout,
  codeSnippets: Code,
  pptContent: Presentation,
  readme: FileText,
  deploymentGuide: Cloud,
};

const OUTPUT_COLORS: Record<OutputKey, string> = {
  projectPlan: "text-blue-600",
  techStack: "text-purple-600",
  databaseSchema: "text-green-600",
  uiDesign: "text-pink-600",
  codeSnippets: "text-orange-600",
  pptContent: "text-red-600",
  readme: "text-indigo-600",
  deploymentGuide: "text-cyan-600",
};

export default function CreateProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      setGeneratingLabel("Connecting to AI...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, selectedOutputs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratingLabel("Saving to your account...");
      const docRef = await addDoc(collection(db, "projects"), {
        userId: user?.uid,
        title,
        description,
        selectedOutputs,
        generatedResults: data.generatedResults,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

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
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  {step > s.id ? <Check className="w-6 h-6" /> : s.id}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">What&apos;s your project about?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Give your project a catchy title and a brief description.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. EcoTracker AI"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your project idea, target audience, and key features..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!title || !description}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Choose your outputs</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Select the resources you want AI to generate for you.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OUTPUT_OPTIONS.map((option) => {
                const Icon = OUTPUT_ICONS[option.id];
                const isSelected = selectedOutputs.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOutput(option.id)}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm ${OUTPUT_COLORS[option.id]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium block ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{option.description}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between pt-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={selectedOutputs.length === 0}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
              >
                <Rocket className="w-5 h-5" />
                <span>Generate Project</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-20 space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold dark:text-white">Generating Magic...</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                {generatingLabel || "Our AI is brainstorming your project plan, tech stack, and everything else you requested. This may take 15-30 seconds."}
              </p>
            </div>
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto opacity-60">
              {selectedOutputs.map((o) => (
                <div key={o} className="flex items-center space-x-2 text-sm text-gray-500 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{OUTPUT_OPTIONS.find((opt) => opt.id === o)?.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
