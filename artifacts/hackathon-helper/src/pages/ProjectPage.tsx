import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Project, OutputKey } from "@/lib/types";
import { TAB_LABELS, TAB_DESCRIPTIONS, ALL_OUTPUTS } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { GeneratePrompt, SectionSkeleton } from "@/components/ui/SkeletonLoader";
import { MentorChat } from "@/components/MentorChat";
import { Button } from "@/components/ui/Button";
import { generateSingleOutput } from "@/lib/api";
import { exportProjectPDF } from "@/lib/pdf";
import { generatePPTX } from "@/lib/ppt";
import {
  Loader2, ArrowLeft, FileDown, Presentation,
  Copy, Share2, Download, FileText, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getContentForCopy } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OutputKey>("projectScores");
  const [exporting, setExporting] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<OutputKey | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          // Set first available generated tab as active
          const firstGenerated = ALL_OUTPUTS.find((k) => data.generatedResults?.[k] != null);
          if (firstGenerated) setActiveTab(firstGenerated);
        } else {
          toast.error("Project not found");
          navigate("/history");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  const handleGenerateSection = async (key: OutputKey) => {
    if (!project || !projectId) return;
    setGeneratingSection(key);
    setActiveTab(key);
    try {
      const result = await generateSingleOutput(
        project.title,
        project.description,
        key,
        project.teamSize ?? 1,
        project.duration ?? "24h"
      );

      await updateDoc(doc(db, "projects", projectId), {
        [`generatedResults.${key}`]: result,
        updatedAt: new Date().toISOString(),
      });

      setProject((prev) =>
        prev
          ? { ...prev, generatedResults: { ...prev.generatedResults, [key]: result } }
          : prev
      );
      toast.success(`${TAB_LABELS[key]} generated!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to generate ${TAB_LABELS[key]}`);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleExportPDF = async () => {
    if (!project) return;
    setExporting(true);
    try {
      await exportProjectPDF(project);
      toast.success("PDF exported!");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPPT = async () => {
    if (!project?.generatedResults.pptContent) {
      toast.error("Generate the Slides section first.");
      return;
    }
    setExporting(true);
    try {
      await generatePPTX(project.title, project.generatedResults.pptContent);
      toast.success("PPTX exported!");
    } catch {
      toast.error("PPT export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project.generatedResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, "-")}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON downloaded!");
  };

  const handleDownloadReadme = () => {
    if (!project?.generatedResults.readme) {
      toast.error("Generate the README section first.");
      return;
    }
    const blob = new Blob([project.generatedResults.readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded!");
  };

  const handleCopy = () => {
    if (!project || !activeTab) return;
    const text = getContentForCopy(project.generatedResults, activeTab);
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const handleShare = async () => {
    if (!project) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.title, text: project.description, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  // Count how many sections are generated
  const generatedCount = ALL_OUTPUTS.filter((k) => project?.generatedResults?.[k] != null).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/2" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 w-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to History
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter dark:text-white">{project.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed text-sm">{project.description}</p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full uppercase tracking-widest">
                {new Date(project.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {project.teamSize && (
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Team of {project.teamSize}
                </span>
              )}
              {project.duration && (
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {project.duration} Duration
                </span>
              )}
              <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={10} /> {generatedCount}/{ALL_OUTPUTS.length} sections ready
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Copy size={14} /> Copy
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Share2 size={14} /> Share
            </button>
            <button onClick={handleDownloadReadme} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <FileText size={14} /> README
            </button>
            <button onClick={handleDownloadJSON} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Download size={14} /> JSON
            </button>
            <button onClick={handleExportPDF} disabled={exporting} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} PDF
            </button>
            <button onClick={handleExportPPT} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Presentation size={14} />} PPT
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max pb-1">
            {ALL_OUTPUTS.map((key) => {
              const isGenerated = project.generatedResults?.[key] != null;
              const isActive = activeTab === key;
              const isGenerating = generatingSection === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : isGenerated
                      ? "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-900/50 text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                  }`}
                >
                  {isGenerating && <Loader2 size={11} className="animate-spin" />}
                  {!isGenerating && isGenerated && <CheckCircle2 size={11} className={isActive ? "text-blue-200" : "text-green-500"} />}
                  {TAB_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm min-h-[400px]"
          >
            {generatingSection === activeTab ? (
              <SectionSkeleton />
            ) : project.generatedResults?.[activeTab] != null ? (
              <ContentRenderer type={activeTab} data={project.generatedResults[activeTab]} />
            ) : (
              <GeneratePrompt
                label={TAB_LABELS[activeTab]}
                description={TAB_DESCRIPTIONS[activeTab]}
                onGenerate={() => handleGenerateSection(activeTab)}
                loading={generatingSection === activeTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <MentorChat
        projectId={project.id || projectId || ""}
        projectTitle={project.title}
        projectDescription={project.description}
      />
    </DashboardLayout>
  );
}
