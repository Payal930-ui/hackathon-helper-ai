import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  LogOut,
  Rocket,
  Menu,
  X,
  User,
  Award,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import toast from "react-hot-toast";

export const Sidebar = () => {
  const [pathname] = useLocation();
  const [, navigate] = useLocation();
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Project", href: "/create-project", icon: PlusCircle },
    { name: "History", href: "/history", icon: History },
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center space-x-2 px-2 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter dark:text-white uppercase">Helper AI</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Theme</span>
              <ThemeToggle />
            </div>

            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <div className="flex items-center space-x-3 px-3 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border-2 border-white dark:border-gray-800 shadow-sm">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    userData?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {userData?.name || "Innovator"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Award size={10} className="text-yellow-500" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {userData?.badges?.length || 0} Badges
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};
