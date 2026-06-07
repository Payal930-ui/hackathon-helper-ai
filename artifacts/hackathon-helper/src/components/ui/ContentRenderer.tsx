import React, { lazy, Suspense } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Clock,
  User,
  TrendingUp,
  Target,
  XCircle,
  Presentation,
  Trophy,
  Zap,
  GitBranch,
} from "lucide-react";
import { Button } from "./Button";
import toast from "react-hot-toast";
import type { OutputKey, PPTSlide, TeamTask, TimelineMilestone, ValidatorResult, ProjectScores, ArchitectureDiagramEntry } from "@/lib/types";

const MermaidDiagramLazy = lazy(() =>
  import("./MermaidDiagram").then((m) => ({ default: m.MermaidDiagram }))
);

interface ContentRendererProps {
  type: OutputKey;
  // @ts-ignore
  data: any;
}

// ── Markdown renderer ──────────────────────────────────────────────────────────
function MarkdownContent({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" = "ul";

  const flushList = (key: string) => {
    if (!listBuffer.length) return;
    const items = [...listBuffer];
    listBuffer = [];
    elements.push(
      <ul key={`list-${key}`} className={`space-y-1.5 my-3 ${listType === "ol" ? "list-decimal list-inside" : ""}`}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {listType === "ul" && <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  lines.forEach((raw, i) => {
    const line = raw;
    if (line.startsWith("# ")) {
      flushList(String(i));
      elements.push(<h1 key={i} className="text-2xl font-black dark:text-white mt-8 mb-3 first:mt-0">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      flushList(String(i));
      elements.push(
        <h2 key={i} className="text-base font-black dark:text-white mt-6 mb-2 flex items-center gap-2 text-blue-600 border-b border-gray-100 dark:border-gray-800 pb-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList(String(i));
      elements.push(<h3 key={i} className="text-sm font-bold dark:text-gray-200 mt-4 mb-1.5">{line.slice(4)}</h3>);
    } else if (/^[-*]\s/.test(line)) {
      listType = "ul";
      listBuffer.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      listType = "ol";
      listBuffer.push(line.replace(/^\d+\.\s/, ""));
    } else if (line === "") {
      flushList(String(i));
      elements.push(<div key={i} className="h-1" />);
    } else if (line.trim()) {
      flushList(String(i));
      // Bold inline
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed my-1">
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j} className="font-bold dark:text-white">{p.slice(2, -2)}</strong>
            ) : p
          )}
        </p>
      );
    }
  });
  flushList("end");
  return <div className="space-y-0.5">{elements}</div>;
}

// ── Color swatch extractor ─────────────────────────────────────────────────────
function extractHexColors(text: string): string[] {
  const matches = text.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  return [...new Set(matches)].slice(0, 10);
}

// ── Score color helper ─────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

// ── Slide color map ────────────────────────────────────────────────────────────
const SLIDE_GRADIENTS: Record<string, string> = {
  title: "from-blue-600 to-indigo-700",
  problem: "from-rose-500 to-red-600",
  solution: "from-emerald-500 to-green-600",
  features: "from-violet-500 to-purple-600",
  architecture: "from-slate-700 to-gray-900",
  techStack: "from-orange-500 to-amber-600",
  workflow: "from-teal-500 to-cyan-600",
  screenshots: "from-pink-500 to-fuchsia-600",
  future: "from-sky-500 to-blue-600",
  thankyou: "from-indigo-500 to-blue-600",
  default: "from-gray-600 to-gray-800",
};

// ── Main renderer ──────────────────────────────────────────────────────────────
export const ContentRenderer = ({ type, data }: ContentRendererProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!data) return <div className="text-gray-400 italic text-sm">No data for this section.</div>;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (!mounted) return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-3xl" />;

  switch (type) {
    // ── Score Dashboard ──────────────────────────────────────────────────────
    case "projectScores": {
      const scores = data as ProjectScores;
      const metrics = [
        { key: "innovation", label: "Innovation", value: scores.innovation ?? 0 },
        { key: "feasibility", label: "Feasibility", value: scores.feasibility ?? 0 },
        { key: "scalability", label: "Scalability", value: scores.scalability ?? 0 },
        { key: "uiux", label: "UI/UX", value: scores.uiux ?? 0 },
        { key: "winningProbability", label: "Win Chance", value: scores.winningProbability ?? 0 },
        ...(scores.marketPotential != null ? [{ key: "marketPotential", label: "Market Fit", value: scores.marketPotential }] : []),
        ...(scores.complexity != null ? [{ key: "complexity", label: "Complexity", value: scores.complexity }] : []),
      ];
      const overallScore = Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length);

      const radarData = metrics.map((m) => ({ subject: m.label, A: m.value, fullMark: 100 }));

      return (
        <div className="space-y-8">
          {/* Overall score */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center shrink-0"
              style={{ borderColor: scoreColor(overallScore) }}>
              <span className="text-3xl font-black" style={{ color: scoreColor(overallScore) }}>{overallScore}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ 100</span>
            </div>
            <div>
              <div className="text-2xl font-black dark:text-white">Overall Score</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: scoreColor(overallScore) + "20", color: scoreColor(overallScore) }}>
                  {scoreLabel(overallScore)}
                </span>
                <Trophy size={16} className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-500 mt-2">{metrics.length} dimensions evaluated</p>
            </div>
          </div>

          {/* Radar + bars side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                  <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={70} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {metrics.map((m) => (
                      <Cell key={m.key} fill={scoreColor(m.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.key} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{m.label}</div>
                <div className="text-2xl font-black mb-2" style={{ color: scoreColor(m.value) }}>{m.value}</div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.value}%`, background: scoreColor(m.value) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Project Plan ─────────────────────────────────────────────────────────
    case "projectPlan":
      return (
        <div className="relative">
          <button
            onClick={() => handleCopy(data as string)}
            className="absolute top-0 right-0 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <Copy size={12} /> Copy
          </button>
          <MarkdownContent text={data as string} />
        </div>
      );

    // ── Tech Stack ───────────────────────────────────────────────────────────
    case "techStack": {
      const entries = Object.entries(data).filter(([k]) => k !== "reasoning");
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(([key, value]) => (
              <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{key}</span>
                <h4 className="text-lg font-black mt-1 dark:text-white leading-tight">{value as string}</h4>
              </div>
            ))}
          </div>
          {data.reasoning && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-7 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-2 mb-3 text-blue-200 text-xs font-bold uppercase tracking-widest">
                <Lightbulb size={14} /> Architectural Reasoning
              </div>
              <p className="leading-relaxed text-sm opacity-95">{data.reasoning}</p>
            </div>
          )}
        </div>
      );
    }

    // ── Database Schema ──────────────────────────────────────────────────────
    case "databaseSchema":
      return (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => handleCopy(data as string)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-800">
            <div className="px-5 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-500 font-mono">schema.sql</span>
            </div>
            <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {data as string}
            </pre>
          </div>
        </div>
      );

    // ── UI/UX Design ─────────────────────────────────────────────────────────
    case "uiDesign": {
      const text = data as string;
      const colors = extractHexColors(text);
      return (
        <div className="space-y-6">
          {colors.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Color Palette</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((hex) => (
                  <div key={hex} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-12 h-12 rounded-xl shadow-md cursor-pointer hover:scale-110 transition-transform border border-gray-100 dark:border-gray-700"
                      style={{ background: hex }}
                      onClick={() => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
                      title={hex}
                    />
                    <span className="text-[10px] font-mono text-gray-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <MarkdownContent text={text} />
        </div>
      );
    }

    // ── Code Snippets ────────────────────────────────────────────────────────
    case "codeSnippets":
      return (
        <div className="space-y-6">
          {(data as { title: string; language: string; code: string }[]).map((snippet, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden border border-gray-800 shadow-xl bg-gray-950">
              <div className="px-5 py-3.5 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-3 text-xs font-bold text-gray-400 uppercase tracking-widest">{snippet.title}</span>
                  <span className="text-[10px] text-gray-600 px-2 py-0.5 bg-gray-800 rounded-md font-mono">{snippet.language}</span>
                </div>
                <button onClick={() => handleCopy(snippet.code)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors font-bold">
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      );

    // ── README ───────────────────────────────────────────────────────────────
    case "readme": {
      const text = data as string;
      return (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                const blob = new Blob([text], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "README.md"; a.click();
                URL.revokeObjectURL(url);
                toast.success("README.md downloaded!");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg"
            >
              ↓ Download .md
            </button>
            <button onClick={() => handleCopy(text)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 prose dark:prose-invert max-w-none overflow-x-auto">
            <MarkdownContent text={text} />
          </div>
        </div>
      );
    }

    // ── Deployment Guide ─────────────────────────────────────────────────────
    case "deploymentGuide": {
      const text = data as string;
      const lines = text.split("\n");
      const steps: string[] = [];
      const intro: string[] = [];
      let inSteps = false;

      lines.forEach((line) => {
        if (/^\d+[.)]\s/.test(line.trim())) {
          inSteps = true;
          steps.push(line.trim().replace(/^\d+[.)]\s*/, ""));
        } else if (!inSteps && line.trim()) {
          intro.push(line.trim());
        }
      });

      if (steps.length > 0) {
        return (
          <div className="space-y-6">
            {intro.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{intro.join(" ")}</p>
            )}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return <MarkdownContent text={text} />;
    }

    // ── PPT Slides ───────────────────────────────────────────────────────────
    case "pptContent": {
      const slides = data as PPTSlide[];
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{slides.length} slides ready to export</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((slide, i) => {
              const gradient = SLIDE_GRADIENTS[slide.type ?? "default"] ?? SLIDE_GRADIENTS.default;
              return (
                <div key={i} className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white overflow-hidden min-h-[160px]`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                        {i + 1} / {slide.type ?? "slide"}
                      </span>
                    </div>
                    <h3 className="text-base font-black leading-tight mb-3">{slide.title}</h3>
                    <div className="text-xs opacity-85 leading-relaxed">
                      {Array.isArray(slide.content) ? (
                        <ul className="space-y-1">
                          {slide.content.slice(0, 5).map((item, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="opacity-60 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                          {slide.content.length > 5 && (
                            <li className="opacity-50">+{slide.content.length - 5} more...</li>
                          )}
                        </ul>
                      ) : (
                        <p className="line-clamp-4">{slide.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Pitches ──────────────────────────────────────────────────────────────
    case "pitches": {
      const pitchItems = [
        { id: "thirtySeconds", label: "30 Second Pitch", icon: <Zap size={16} />, accent: "blue" },
        { id: "oneMinute", label: "1 Minute Pitch", icon: <TrendingUp size={16} />, accent: "purple" },
        { id: "threeMinutes", label: "3 Minute Pitch", icon: <Target size={16} />, accent: "indigo" },
      ];
      return (
        <div className="space-y-5">
          {pitchItems.map((pitch) => (
            <div key={pitch.id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 relative group">
              <div className={`flex items-center gap-2 mb-3 text-${pitch.accent}-600 font-black text-xs uppercase tracking-widest`}>
                {pitch.icon}
                {pitch.label}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{data[pitch.id]}</p>
              <button
                onClick={() => handleCopy(data[pitch.id])}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          ))}
        </div>
      );
    }

    // ── Team Tasks ───────────────────────────────────────────────────────────
    case "teamTasks":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data as TeamTask[]).map((member, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                  <User size={18} />
                </div>
                <h4 className="font-black dark:text-white text-sm">{member.role}</h4>
              </div>
              <ul className="space-y-2">
                {member.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    // ── Timeline ─────────────────────────────────────────────────────────────
    case "timeline":
      return (
        <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-blue-500 before:to-transparent">
          {(data as TimelineMilestone[]).map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-8 top-2 w-5 h-5 rounded-full bg-blue-600 border-4 border-white dark:border-gray-950 shadow-md group-hover:scale-110 transition-transform" />
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.time}</span>
                </div>
                <p className="font-bold text-sm dark:text-white leading-snug">{item.task}</p>
              </div>
            </div>
          ))}
        </div>
      );

    // ── Validator ────────────────────────────────────────────────────────────
    case "validator": {
      const v = data as ValidatorResult;
      const sections = [
        { key: "strengths", label: "Strengths", icon: <CheckCircle2 size={16} />, items: v.strengths, bg: "green" },
        { key: "weaknesses", label: "Weaknesses", icon: <XCircle size={16} />, items: v.weaknesses ?? [], bg: "red" },
        { key: "risks", label: "Risks", icon: <AlertTriangle size={16} />, items: v.risks, bg: "yellow" },
        { key: "suggestions", label: "Suggestions", icon: <Lightbulb size={16} />, items: v.suggestions, bg: "blue" },
      ];
      const colorMap: Record<string, string> = {
        green: "text-green-600 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400",
        red: "text-red-600 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400",
        yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
      };
      return (
        <div className="space-y-6">
          {v.score != null && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-black" style={{ color: scoreColor(v.score) }}>{v.score}/100</div>
              <div>
                <div className="font-bold dark:text-white text-sm">Validator Score</div>
                {v.verdict && <p className="text-sm text-gray-500 mt-0.5">{v.verdict}</p>}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sections.map((sec) => (
              <div key={sec.key} className="space-y-2">
                <h4 className={`font-black flex items-center gap-2 text-sm ${colorMap[sec.bg].split(" ")[0]}`}>
                  {sec.icon} {sec.label}
                </h4>
                <div className="space-y-2">
                  {(sec.items ?? []).map((item, i) => (
                    <div key={i} className={`p-3 rounded-xl text-sm border ${colorMap[sec.bg].split(" ").slice(1).join(" ")}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Architecture Diagrams ─────────────────────────────────────────────────
    case "architectureDiagram": {
      const diagrams = Array.isArray(data) ? (data as ArchitectureDiagramEntry[]) : [];
      if (!diagrams.length) {
        return (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <GitBranch size={40} strokeWidth={1.5} />
            <p className="text-sm">No diagrams generated</p>
          </div>
        );
      }

      const DIAGRAM_ICONS: Record<string, string> = {
        "System Architecture": "🏗️",
        "User Flow": "🔀",
        "API Flow": "⚡",
        "Data Model": "🗄️",
      };

      const DIAGRAM_COLORS: Record<string, string> = {
        "System Architecture": "from-blue-600 to-indigo-600",
        "User Flow": "from-purple-600 to-pink-600",
        "API Flow": "from-orange-500 to-amber-500",
        "Data Model": "from-emerald-600 to-teal-600",
      };

      return (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 mb-2">
            {diagrams.map((d, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 bg-gradient-to-r ${DIAGRAM_COLORS[d.title] ?? "from-gray-600 to-gray-700"} text-white text-sm font-semibold shadow`}
              >
                <span className="text-xl">{DIAGRAM_ICONS[d.title] ?? "📊"}</span>
                {d.title}
              </div>
            ))}
          </div>

          {diagrams.map((entry, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DIAGRAM_COLORS[entry.title] ?? "from-gray-600 to-gray-700"} flex items-center justify-center text-base shadow`}>
                  {DIAGRAM_ICONS[entry.title] ?? "📊"}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{entry.title}</h3>
                <button
                  onClick={() => handleCopy(entry.diagram)}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <Copy size={12} /> Copy Mermaid
                </button>
              </div>
              <Suspense
                fallback={
                  <div className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl h-56" />
                }
              >
                <MermaidDiagramLazy chart={entry.diagram} />
              </Suspense>
            </div>
          ))}
        </div>
      );
    }

    // ── Default (fallback) ───────────────────────────────────────────────────
    default:
      return (
        <div className="relative">
          <button
            onClick={() => handleCopy(typeof data === "string" ? data : JSON.stringify(data, null, 2))}
            className="absolute top-0 right-0 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <Copy size={12} /> Copy
          </button>
          {typeof data === "string" ? (
            <MarkdownContent text={data} />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      );
  }
};
