"use client";

import type { OutputKey, PPTSlide } from "@/lib/types";
import { formatContent } from "@/lib/utils";

interface CodeSnippet {
  title: string;
  language: string;
  code: string;
}

interface ContentRendererProps {
  outputKey: OutputKey;
  content: unknown;
}

function isPPTSlideArray(value: unknown): value is PPTSlide[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "title" in value[0] &&
    "content" in value[0]
  );
}

function isCodeSnippetArray(value: unknown): value is CodeSnippet[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "code" in value[0]
  );
}

export function ContentRenderer({ outputKey, content }: ContentRendererProps) {
  if (outputKey === "codeSnippets" && isCodeSnippetArray(content)) {
    return (
      <div className="space-y-6">
        {content.map((snippet, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                {snippet.title}
              </span>
              <span className="text-xs text-gray-500 uppercase">{snippet.language}</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
              {snippet.code}
            </pre>
          </div>
        ))}
      </div>
    );
  }

  if (outputKey === "pptContent" && isPPTSlideArray(content)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((slide, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h4 className="font-bold text-gray-900 dark:text-white">{slide.title}</h4>
            </div>
            {Array.isArray(slide.content) ? (
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {slide.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">{slide.content}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (outputKey === "techStack" && typeof content === "object" && content !== null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(content as Record<string, string>).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50"
          >
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              {key}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    );
  }

  const text = formatContent(content);

  if (outputKey === "readme" || outputKey === "projectPlan" || outputKey === "deploymentGuide") {
    return (
      <div className="prose prose-blue dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent p-0 border-0">
          {text}
        </pre>
      </div>
    );
  }

  return (
    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
      {text}
    </pre>
  );
}
