import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { CheckCircle2, AlertTriangle, Lightbulb, Copy, Clock, User, TrendingUp, Target } from "lucide-react";
import { Button } from "./Button";
import toast from "react-hot-toast";
import type { OutputKey } from "@/lib/types";

interface ContentRendererProps {
  type: OutputKey;
  // @ts-ignore
  data: any;
}

export const ContentRenderer = ({ type, data }: ContentRendererProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!data) return <div className="text-gray-500 italic">No data generated for this section.</div>;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!mounted) {
    return <div className="animate-pulse bg-gray-50 dark:bg-gray-900/50 h-64 rounded-3xl" />;
  }

  switch (type) {
    case "projectScores": {
      const scoreData = [
        { subject: "Innovation", A: data.innovation, fullMark: 100 },
        { subject: "Feasibility", A: data.feasibility, fullMark: 100 },
        { subject: "Scalability", A: data.scalability, fullMark: 100 },
        { subject: "UI/UX", A: data.uiux, fullMark: 100 },
        { subject: "Winning %", A: data.winningProbability, fullMark: 100 },
      ];
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Radar name="Project Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold dark:text-white">AI Analysis Summary</h4>
              {scoreData.map((item) => (
                <div key={item.subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{item.subject}</span>
                    <span className="text-blue-600 font-bold">{item.A}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${item.A}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "pitches":
      return (
        <div className="space-y-6">
          {[
            { id: "thirtySeconds", label: "30 Second Pitch", icon: <Clock size={18} /> },
            { id: "oneMinute", label: "1 Minute Pitch", icon: <TrendingUp size={18} /> },
            { id: "threeMinutes", label: "3 Minute Pitch", icon: <Target size={18} /> },
          ].map((pitch) => (
            <div key={pitch.id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative group">
              <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase tracking-wider text-xs">
                {pitch.icon}
                {pitch.label}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{data[pitch.id]}</p>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(data[pitch.id])} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy size={14} className="mr-2" />Copy
              </Button>
            </div>
          ))}
        </div>
      );

    case "teamTasks":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((member: { role: string; tasks: string[] }, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <h4 className="font-bold dark:text-white">{member.role}</h4>
              </div>
              <ul className="space-y-3">
                {member.tasks.map((task: string, tIdx: number) => (
                  <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "timeline":
      return (
        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
          {data.map((item: { time: string; task: string }, idx: number) => (
            <div key={idx} className="relative">
              <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-blue-600 border-4 border-white dark:border-gray-950 shadow-sm" />
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm inline-block min-w-[200px]">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.time}</span>
                <p className="mt-1 font-bold dark:text-white">{item.task}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case "validator":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-green-600"><CheckCircle2 size={18} /> Strengths</h4>
            <div className="space-y-2">
              {data.strengths.map((s: string, i: number) => (
                <div key={i} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl text-sm text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">{s}</div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-red-600"><AlertTriangle size={18} /> Risks</h4>
            <div className="space-y-2">
              {data.risks.map((r: string, i: number) => (
                <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-sm text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">{r}</div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-blue-600"><Lightbulb size={18} /> Expert Suggestions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.suggestions.map((s: string, i: number) => (
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">{s}</div>
              ))}
            </div>
          </div>
        </div>
      );

    case "techStack":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data).map(([key, value]) =>
            key !== "reasoning" ? (
              <div key={key} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{key}</span>
                <h4 className="text-xl font-bold mt-1 dark:text-white">{value as string}</h4>
              </div>
            ) : null
          )}
          {data.reasoning && (
            <div className="sm:col-span-2 lg:col-span-3 bg-blue-600 p-8 rounded-3xl text-white">
              <h4 className="text-lg font-bold mb-2">Architectural Reasoning</h4>
              <p className="opacity-90 leading-relaxed">{data.reasoning}</p>
            </div>
          )}
        </div>
      );

    case "codeSnippets":
      return (
        <div className="space-y-8">
          {data.map((snippet: { title: string; language: string; code: string }, idx: number) => (
            <div key={idx} className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-gray-950">
              <div className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs font-bold text-gray-400 tracking-widest uppercase">{snippet.title} ({snippet.language})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(snippet.code)} className="text-gray-400 hover:text-white">
                  <Copy size={14} className="mr-2" />Copy Code
                </Button>
              </div>
              <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
            {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
};
