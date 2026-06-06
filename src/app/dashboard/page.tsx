"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { ProjectCardSkeleton } from "@/components/ui/Skeleton";
import { Plus, History as HistoryIcon, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [recentProjects, setRecentProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchRecentProjects = async () => {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as (Project & { id: string })[];
        setRecentProjects(projects);
        setLoading(false);
      };
      fetchRecentProjects();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userData?.name || "Builder"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            What are we building today?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/create-project"
            className="group p-6 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Plus className="text-white w-6 h-6" />
              </div>
              <ArrowRight className="text-white/50 group-hover:text-white w-5 h-5 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white">Create New Project</h3>
            <p className="text-blue-100 mt-2">
              Generate a complete project plan and resources using AI.
            </p>
          </Link>

          <Link
            href="/history"
            className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <HistoryIcon className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-white w-5 h-5 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project History</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage your previous hackathon projects.
            </p>
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Projects</h2>
            <Link href="/history" className="text-blue-600 hover:underline text-sm font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Rocket className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{project.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No projects found. Start by creating one!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
