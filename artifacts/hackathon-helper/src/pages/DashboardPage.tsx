import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Link } from "wouter";
import type { Project } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PlusCircle, Rocket, Clock, TrendingUp, Award, Star, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setRecentProjects(projects);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekProjects = projects.filter((p) => new Date(p.createdAt) >= oneWeekAgo);
        setStats({ total: projects.length, thisWeek: weekProjects.length });
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{greeting},</p>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white mt-1">
              {userData?.name?.split(" ")[0] || "Innovator"} 👋
            </h1>
          </div>
          <Link href="/create-project">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Rocket />} label="Total Projects" value={stats.total} color="blue" />
          <StatCard icon={<Clock />} label="This Week" value={stats.thisWeek} color="purple" />
          <StatCard icon={<Award />} label="Badges" value={userData?.badges?.length || 0} color="yellow" />
          <StatCard icon={<Star />} label="AI Sessions" value={recentProjects.filter((p) => p.selectedOutputs.length >= 5).length} color="green" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : recentProjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black dark:text-white">Recent Projects</h2>
              <Link href="/history">
                <Button variant="ghost" className="text-blue-600 font-bold text-sm">
                  View All <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-black dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/project/${project.id}`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
            <Rocket className="text-blue-600 w-5 h-5" />
          </div>
          <h3 className="font-black text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{project.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              {project.selectedOutputs.length} outputs
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Rocket className="text-blue-600 w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black dark:text-white mb-3">Ready to build something amazing?</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">Create your first AI-powered project plan and get everything you need to win your next hackathon.</p>
      <Link href="/create-project">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create First Project
        </Button>
      </Link>
    </div>
  );
}
