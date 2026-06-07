import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Project, OutputKey } from "@/lib/types";
import { TAB_LABELS } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { MentorChat } from "@/components/MentorChat";
import { Button } from "@/components/ui/Button";
import { exportProjectPDF } from "@/lib/pdf";
import { generatePPTX } from "@/lib/ppt";
import { Loader2, ArrowLeft, FileDown, Presentation, Copy, Share2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<OutputKey | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          if (data.selectedOutputs?.length > 0) {
            setActiveTab(data.selectedOutputs[0]);
          }
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

  const handleExportPDF = async () => {
    if (!project) return;
    setExporting(true);
    try {
      await exportProjectPDF(project);
      toast.success("PDF exported!");
    } catch (error) {
      toast.error("PDF export failed");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPPT = async () => {
    if (!project || !project.generatedResults.pptContent) {
      toast.error("No PPT content. Please regenerate with PPT output selected.");
      return;
    }
    setExporting(true);
    try {
      await generatePPTX(project.title, project.generatedResults.pptContent);
      toast.success("PPTX exported!");
    } catch (error) {
      toast.error("PPT export failed");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = () => {
    if (!project || !activeTab) return;
    const text = getContentForCopy(project.generatedResults, activeTab);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleShare = async () => {
    if (!project) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-gray-500 font-medium">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-bold mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to History
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter dark:text-white">{project.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-widest">
                {new Date(project.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {project.teamSize && (
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  Team of {project.teamSize}
                </span>
              )}
              {project.duration && (
                <span className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full uppercase tracking-widest">
                  {project.duration} Duration
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button variant="outline" onClick={handleCopy} className="rounded-xl dark:border-gray-700 font-bold">
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleShare} className="rounded-xl dark:border-gray-700 font-bold">
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={exporting} className="rounded-xl dark:border-gray-700 font-bold">
              {exporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileDown size={16} className="mr-2" />}
              PDF
            </Button>
            {project.selectedOutputs.includes("pptContent") && (
              <Button onClick={handleExportPPT} disabled={exporting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">
                {exporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Presentation size={16} className="mr-2" />}
                Export PPT
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {project.selectedOutputs.map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {TAB_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm min-h-[400px]"
            >
              <ContentRenderer
                type={activeTab}
                data={project.generatedResults[activeTab]}
              />
            </motion.div>
          )}
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
