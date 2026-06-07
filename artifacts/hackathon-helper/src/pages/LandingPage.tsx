import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Rocket, Target, Layout, Code, FileText, Zap, Shield, Star, Users, ArrowRight, Bot, Sparkles, Presentation } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Rocket className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Helper AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Workflow</a>
              <a href="#testimonials" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Success Stories</a>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-gray-600 dark:text-gray-400">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles size={14} />
              The #1 AI Tool for Hackathons
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
              Turn Ideas Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Winning Projects</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              From brainstorming to deployment. Our advanced AI mentor helps you build production-ready projects in record time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/signup">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 rounded-3xl font-black transition-all shadow-2xl shadow-blue-500/40 transform hover:scale-105">
                  Start Your Journey
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-12 py-8 rounded-3xl font-bold border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-900">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by students from</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale contrast-200">
                <span className="text-xl font-black tracking-tighter italic">MIT</span>
                <span className="text-xl font-black tracking-tighter italic">STANFORD</span>
                <span className="text-xl font-black tracking-tighter italic">HARVARD</span>
                <span className="text-xl font-black tracking-tighter italic">OXFORD</span>
                <span className="text-xl font-black tracking-tighter italic">IIT</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Everything You Need To Win</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">Skip the planning phase and start coding. Our AI handles the heavy lifting so you can focus on building.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Zap className="text-blue-600" />} title="AI Project Scores" description="Get instant feedback on innovation, feasibility, and winning probability before you start." />
            <FeatureCard icon={<Bot className="text-purple-600" />} title="24/7 AI Mentor" description="Project-specific chat assistant that knows your tech stack and helps you debug in real-time." />
            <FeatureCard icon={<Layout className="text-pink-600" />} title="Smart UI/UX" description="Complete design systems with color palettes, typography, and responsive wireframes." />
            <FeatureCard icon={<FileText className="text-orange-600" />} title="Pitch Generator" description="Craft the perfect 30s, 1m, or 3m pitch to impress judges and investors." />
            <FeatureCard icon={<Users className="text-green-600" />} title="Task Distributor" description="Automatically assign tasks based on your team size and member skillsets." />
            <FeatureCard icon={<Presentation className="text-red-600" />} title="PPT Architect" description="Generate a professional 10-slide deck ready for your final presentation." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-black tracking-tight mb-8">From Zero To <span className="text-blue-600">MVP</span> In Seconds</h2>
              <div className="space-y-12">
                <Step number="01" title="Define Your Vision" description="Enter your project title and a brief description. No idea is too small or too big." />
                <Step number="02" title="Select Your Resources" description="Choose from 13+ AI-generated outputs including code snippets, schemas, and pitches." />
                <Step number="03" title="Start Building" description="Get a complete project dashboard with everything you need to execute and win." />
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[40px] p-2 shadow-2xl shadow-blue-500/20">
                <div className="bg-white dark:bg-gray-900 rounded-[38px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" alt="Dashboard Preview" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-bounce">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                    <Star size={24} fill="white" />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white">Project Score: 98%</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Innovation Level: Expert</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase dark:text-white">Helper AI</span>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-8">© 2026 Hackathon Helper AI. Built for innovators, by innovators.</p>
          <div className="flex justify-center gap-8">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Github</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-10 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all"
    >
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-8 shadow-inner">{icon}</div>
      <h3 className="text-2xl font-black mb-4 dark:text-white tracking-tight">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-4xl font-black text-blue-100 dark:text-blue-900/30 transition-colors group-hover:text-blue-600">{number}</div>
      <div>
        <h3 className="text-xl font-black mb-2 dark:text-white tracking-tight">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{description}</p>
      </div>
    </div>
  );
}
