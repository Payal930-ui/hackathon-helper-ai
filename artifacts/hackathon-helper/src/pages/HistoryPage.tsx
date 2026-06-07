import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Link } from "wouter";
import type { Project } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Rocket, Loader2, Trash2, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (!search) {
      setFiltered(projects);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        projects.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, projects]);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white">Project History</h1>
          <p className="text-gray-500 mt-2 font-medium">{projects.length} project{projects.length !== 1 ? "s" : ""} created</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-12 py-6 rounded-2xl dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-base"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="text-blue-600 w-8 h-8" />
            </div>
            <p className="font-bold dark:text-white text-lg">{search ? "No projects found" : "No projects yet"}</p>
            <p className="text-gray-500 text-sm mt-2">{search ? "Try a different search term" : "Create your first project to get started"}</p>
            {!search && (
              <Link href="/create-project">
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 shadow-xl shadow-blue-500/20">
                  Create Project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                      <Rocket className="text-blue-600 w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 dark:text-white truncate">{project.title}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg uppercase tracking-wider">
                      {project.selectedOutputs.length} outputs
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/project/${project.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <ExternalLink size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(project.id!)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
