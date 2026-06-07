"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { 
  Rocket, 
  History as HistoryIcon, 
  Plus, 
  ArrowRight, 
  BarChart3, 
  Clock, 
  FileText, 
  Presentation,
  Zap,
  Award
} from "lucide-react";
import Link from "next/link";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    hoursSaved: 0,
    aiRequests: 0,
    downloads: 0
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecentProjects(projects.slice(0, 3));
        
        // Calculate stats
        setStats({
          totalProjects: projects.length,
          hoursSaved: projects.length * 4, // Assume 4 hours saved per project
          aiRequests: projects.reduce((acc, p: any) => acc + (p.selectedOutputs?.length || 0), 0),
          downloads: projects.length * 2 // Simulated
        });
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const chartData = [
    { name: "Mon", projects: 1 },
    { name: "Tue", projects: 3 },
    { name: "Wed", projects: 2 },
    { name: "Thu", projects: 5 },
    { name: "Fri", projects: 4 },
    { name: "Sat", projects: 6 },
    { name: "Sun", projects: stats.totalProjects },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome, {userData?.name?.split(" ")[0] || "Innovator"}! 🚀
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Ready to win your next hackathon? Let&apos;s build something amazing.
            </p>
          </motion.div>
          
          <Link href="/create-project">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              New Project
            </motion.button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Rocket className="text-blue-600" />} label="Total Projects" value={stats.totalProjects} delta="+2 this week" />
          <StatCard icon={<Clock className="text-purple-600" />} label="Hours Saved" value={`${stats.hoursSaved}h`} delta="Expert efficiency" />
          <StatCard icon={<Zap className="text-yellow-600" />} label="AI Requests" value={stats.aiRequests} delta="Powered by Gemini" />
          <StatCard icon={<Award className="text-emerald-600" />} label="Badges Earned" value={userData?.badges?.length || 0} delta="Level up!" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Innovation Activity
              </h3>
              <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-500 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="projects" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-gray-50 dark:bg-gray-800 animate-pulse rounded-2xl" />
              )}
            </div>
          </motion.div>

          {/* Recent Projects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <HistoryIcon size={20} className="text-blue-600" />
                Recent Projects
              </h3>
              <Link href="/history" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />)
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Rocket size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{project.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No projects yet. Start your first one!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode, label: string, value: string | number, delta: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">{icon}</div>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">{delta}</span>
      </div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black mt-1 dark:text-white">{value}</h3>
    </motion.div>
  );
}
