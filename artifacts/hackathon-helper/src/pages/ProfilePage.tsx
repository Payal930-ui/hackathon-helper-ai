import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { ACHIEVEMENTS } from "@/lib/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2, Trophy, Star, Clock, Rocket, Code, FileText } from "lucide-react";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "projects"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const earnedBadges = userData?.badges || [];
  const totalOutputs = projects.reduce((acc, p) => acc + p.selectedOutputs.length, 0);
  const hasReadme = projects.some((p) => p.selectedOutputs.includes("readme"));
  const hasPPT = projects.some((p) => p.selectedOutputs.includes("pptContent"));

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-3xl">
        <h1 className="text-4xl font-black tracking-tighter dark:text-white">My Profile</h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex items-center justify-center text-blue-600 text-2xl font-black border-4 border-white dark:border-gray-800 shadow-xl">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    userData?.name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white">{userData?.name || "Innovator"}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{userData?.email || user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Rocket size={18} />} label="Projects" value={projects.length} />
              <StatCard icon={<Star size={18} />} label="Outputs" value={totalOutputs} />
              <StatCard icon={<Code size={18} />} label="Code Snippets" value={projects.filter(p => p.selectedOutputs.includes("codeSnippets")).length} />
              <StatCard icon={<FileText size={18} />} label="READMEs" value={projects.filter(p => p.selectedOutputs.includes("readme")).length} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-yellow-500 w-6 h-6" />
                <h2 className="text-xl font-black dark:text-white">Achievements</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((ach) => {
                  const earned = earnedBadges.includes(ach.id)
                    || (ach.id === "first_project" && projects.length >= 1)
                    || (ach.id === "five_projects" && projects.length >= 5)
                    || (ach.id === "ten_projects" && projects.length >= 10)
                    || (ach.id === "readme_master" && hasReadme)
                    || (ach.id === "ppt_creator" && hasPPT);

                  return (
                    <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${earned ? "border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10" : "border-gray-100 dark:border-gray-800 opacity-40 grayscale"}`}>
                      <span className="text-3xl">{ach.icon}</span>
                      <div>
                        <p className={`font-black text-sm ${earned ? "text-yellow-800 dark:text-yellow-400" : "text-gray-500"}`}>{ach.name}</p>
                        <p className="text-xs text-gray-400">{ach.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600">{icon}</div>
      <p className="text-2xl font-black dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
