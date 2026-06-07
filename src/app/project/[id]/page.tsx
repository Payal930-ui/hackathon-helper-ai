"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { MentorChat } from "@/components/MentorChat";
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
  Star,
  MessageSquare,
  Users,
  Clock,
  ShieldCheck,
  Pencil,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OutputKey, Project, TAB_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const TAB_ICONS: Record<string, React.ComponentType<any>> = {
  projectPlan: ClipboardList,
  techStack: Code,
  databaseSchema: Database,
  uiDesign: Layout,
  codeSnippets: Code,
  pptContent: Presentation,
  readme: FileText,
  deploymentGuide: Cloud,
  projectScores: Star,
  pitches: MessageSquare,
  teamTasks: Users,
  timeline: Clock,
  validator: ShieldCheck,
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
        toast.error("Failed to fetch project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, router]);

  const handleSaveEdit = async () => {
    if (!id || !project) return;
    setSaving(true);
    try {
      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, {
        title: editTitle,
        description: editDescription,
        updatedAt: new Date().toISOString(),
      });
      setProject({ ...project, title: editTitle, description: editDescription });
      setIsEditing(false);
      toast.success("Project updated!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        toast.success("Project deleted");
        router.push("/history");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8 max-w-5xl mx-auto">
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl w-1/3"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3"></div>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-10 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0"></div>
            ))}
          </div>
          <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span onClick={() => router.push("/history")} className="hover:text-blue-600 cursor-pointer transition-colors">History</span>
              <ChevronRight size={14} />
              <span className="text-blue-600">Project Details</span>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-2xl font-bold dark:bg-gray-800 border-none px-0 focus-visible:ring-0" />
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-500 resize-none min-h-[100px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-xl"><X size={16} className="mr-2" /> Cancel</Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{project.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">{project.description}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute -top-1 -right-8 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 transition-all"
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
              <Download size={18} className="mr-2" />
              Export
            </Button>
            <Button onClick={handleDelete} variant="ghost" className="rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {project.selectedOutputs?.map((key) => {
            const Icon = TAB_ICONS[key] || ClipboardList;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-sm ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-blue-500/50"
                }`}
              >
                <Icon size={16} />
                {TAB_LABELS[key]}
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-950/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                {activeTab && TAB_ICONS[activeTab] && (() => {
                  const Icon = TAB_ICONS[activeTab];
                  return <Icon size={24} />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white">{activeTab ? TAB_LABELS[activeTab] : ""} Analysis</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Generated by Hackathon Helper AI</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => {
                const text = JSON.stringify(project.generatedResults[activeTab as OutputKey], null, 2);
                navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard!");
              }} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                <Copy size={20} />
              </Button>
            </div>
          </div>
          
          <div className="p-10">
            <ContentRenderer type={activeTab as OutputKey} data={project.generatedResults[activeTab as OutputKey]} />
          </div>
        </motion.div>

        {/* AI Mentor Chat */}
        <MentorChat 
          projectId={id} 
          projectTitle={project.title} 
          projectDescription={project.description} 
        />
      </div>
    </DashboardLayout>
  );
}

function Loader2({ size, className }: { size?: number, className?: string }) {
  return <RefreshCw size={size} className={`animate-spin ${className}`} />;
}
