"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { ProjectDetailSkeleton } from "@/components/ui/Skeleton";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  Download,
  Copy,
  FileText,
  Code,
  Layout,
  Database,
  Presentation,
  Cloud,
  ChevronRight,
  Trash2,
  ClipboardList,
  Pencil,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TAB_LABELS, type OutputKey, type Project } from "@/lib/types";
import { getContentForCopy } from "@/lib/utils";
import { exportProjectPDF } from "@/lib/pdf";
import { generatePPTX } from "@/lib/ppt";

const TAB_ICONS: Record<OutputKey, React.ComponentType<{ className?: string }>> = {
  projectPlan: ClipboardList,
  techStack: Code,
  databaseSchema: Database,
  uiDesign: Layout,
  codeSnippets: Code,
  pptContent: Presentation,
  readme: FileText,
  deploymentGuide: Cloud,
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OutputKey | "">("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          setEditTitle(data.title);
          setEditDescription(data.description);
          if (data.selectedOutputs?.length > 0) {
            setActiveTab(data.selectedOutputs[0]);
          }
        } else {
          toast.error("Project not found");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to fetch project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, router]);

  const handleCopy = () => {
    if (!project || !activeTab) return;
    const text = getContentForCopy(project.generatedResults, activeTab);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadREADME = () => {
    if (!project?.generatedResults?.readme) return;
    const element = document.createElement("a");
    const file = new Blob([project.generatedResults.readme], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "README.md";
    document.body.appendChild(element);
    element.click();
    toast.success("README downloaded!");
  };

  const exportPDF = async () => {
    if (!project) return;
    try {
      await exportProjectPDF(project);
      toast.success("PDF exported!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const exportPPT = async () => {
    if (!project?.generatedResults?.pptContent) {
      toast.error("PPT content not available");
      return;
    }
    try {
      const slides = Array.isArray(project.generatedResults.pptContent)
        ? project.generatedResults.pptContent
        : [];
      await generatePPTX(project.title, slides);
      toast.success("PPT exported!");
    } catch (error) {
      console.error("Error exporting PPT:", error);
      toast.error("Failed to export PPT");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        toast.success("Project deleted");
        router.push("/history");
      } catch {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !editTitle.trim() || !editDescription.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "projects", id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        updatedAt: new Date().toISOString(),
      });
      setProject((prev) =>
        prev
          ? { ...prev, title: editTitle.trim(), description: editDescription.trim() }
          : null
      );
      setIsEditing(false);
      toast.success("Project updated!");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!project || !id) return;
    if (!confirm("This will regenerate all AI content. Continue?")) return;

    setRegenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          selectedOutputs: project.selectedOutputs,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await updateDoc(doc(db, "projects", id), {
        generatedResults: data.generatedResults,
        updatedAt: new Date().toISOString(),
      });

      setProject((prev) =>
        prev ? { ...prev, generatedResults: data.generatedResults } : null
      );
      toast.success("Content regenerated!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to regenerate"
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ProjectDetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span onClick={() => router.push("/history")} className="hover:text-blue-600 cursor-pointer">
                History
              </span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">{project.title}</span>
            </div>

            {isEditing ? (
              <div className="space-y-3 mt-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(project.title);
                      setEditDescription(project.description);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{project.description}</p>
              </>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
              Regenerate
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {project.selectedOutputs?.map((key) => {
            const Icon = TAB_ICONS[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-blue-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{TAB_LABELS[key]}</span>
              </button>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              {activeTab && (() => {
                const Icon = TAB_ICONS[activeTab];
                return <Icon className="w-5 h-5 text-blue-600" />;
              })()}
              <span>{activeTab && TAB_LABELS[activeTab]}</span>
            </h3>
            <div className="flex items-center space-x-2">
              {activeTab === "readme" && (
                <button
                  onClick={downloadREADME}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Download README"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              {activeTab === "pptContent" && (
                <button
                  onClick={exportPPT}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Download PPT"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab && project.generatedResults && (
                  <ContentRenderer
                    outputKey={activeTab}
                    content={project.generatedResults[activeTab]}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
