"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Rocket,
  Target,
  Layout,
  Code,
  FileText,
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Star,
  Cloud,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="gradient-hero absolute inset-0 pointer-events-none" />

      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Rocket className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">Hackathon Helper AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Hackathon Companion
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Win Your Next Hackathon with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Generate project plans, tech stacks, database schemas, code snippets, PPT presentations, and deployment guides in seconds. Focus on building — let AI handle the planning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/40 hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Building Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto glass-card text-gray-900 dark:text-white text-lg px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              >
                View Features
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: "8 Outputs", sub: "Generated instantly" },
              { label: "10+ Slides", sub: "Pitch-ready PPT" },
              { label: "1-Click", sub: "Export PDF/PPT" },
              { label: "Free", sub: "Start building now" },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative py-20 bg-gray-50/80 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for a winning project</h2>
            <p className="text-gray-600 dark:text-gray-400">Streamline your hackathon workflow from idea to deployment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Target className="w-7 h-7 text-blue-600" />} title="Project Plan" description="Step-by-step roadmap from ideation to demo day." />
            <FeatureCard icon={<Code className="w-7 h-7 text-purple-600" />} title="Tech Stack" description="Tailored technology recommendations with rationale." />
            <FeatureCard icon={<Database className="w-7 h-7 text-green-600" />} title="Database Schema" description="ER diagrams and data models to kickstart your backend." />
            <FeatureCard icon={<Layout className="w-7 h-7 text-pink-600" />} title="UI/UX Design" description="Color palettes, layouts, and responsive design ideas." />
            <FeatureCard icon={<FileText className="w-7 h-7 text-orange-600" />} title="PPT Presentation" description="Professional 10-slide pitch deck for judges." />
            <FeatureCard icon={<Code className="w-7 h-7 text-red-600" />} title="Code Snippets" description="Production-ready starter code you can copy-paste." />
            <FeatureCard icon={<CheckCircle className="w-7 h-7 text-indigo-600" />} title="README" description="Complete documentation ready for your repo." />
            <FeatureCard icon={<Cloud className="w-7 h-7 text-cyan-600" />} title="Deployment Guide" description="Deploy on Render with step-by-step instructions." />
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="01" title="Enter Project Idea" description="Tell us your project title and description in a few words." icon={<Zap className="w-6 h-6" />} />
            <StepCard number="02" title="Select Outputs" description="Choose which AI-generated resources you need for your hackathon." icon={<Sparkles className="w-6 h-6" />} />
            <StepCard number="03" title="Get Results" description="Instantly receive a complete project package ready for execution." icon={<Rocket className="w-6 h-6" />} />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Hackathon Participants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Hackathon Helper AI saved us 4 hours of planning. We started coding immediately and won best innovation!"
              author="Alex Chen"
              role="Winner, HackMIT"
            />
            <TestimonialCard
              quote="The PPT generator alone is worth it. Our pitch deck looked like we spent days on it."
              author="Priya Sharma"
              role="Finalist, DevFest"
            />
            <TestimonialCard
              quote="From idea to deployment guide in under a minute. This is a game-changer for hackathons."
              author="Marcus Johnson"
              role="Team Lead, TechCrunch Disrupt"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to win your next hackathon?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of builders using AI to ship faster and pitch better.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/40"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>© 2026 Hackathon Helper AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <GlassCard hover className="p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </GlassCard>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <GlassCard className="p-8 text-center relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="text-4xl font-black text-blue-100 dark:text-blue-900/30 mb-2 mt-4">{number}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </GlassCard>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="italic opacity-90 mb-4">&quot;{quote}&quot;</p>
      <p className="font-bold">{author}</p>
      <p className="text-sm opacity-75">{role}</p>
    </div>
  );
}
