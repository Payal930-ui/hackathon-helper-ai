import { Loader2, Sparkles } from "lucide-react";

export function SectionSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/3" />
        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-16" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-4/5" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-2/3" />
      </div>
    </div>
  );
}

interface GeneratePromptProps {
  label: string;
  description: string;
  onGenerate: () => void;
  loading: boolean;
}

export function GeneratePrompt({ label, description, onGenerate, loading }: GeneratePromptProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800/50 gap-5 p-8">
      <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-lg font-black dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate {label}
          </>
        )}
      </button>
    </div>
  );
}
