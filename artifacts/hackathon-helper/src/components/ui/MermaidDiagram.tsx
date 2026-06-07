import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

type MermaidModule = typeof import("mermaid");
let mermaidCache: MermaidModule["default"] | null = null;

async function getMermaid(isDark: boolean): Promise<MermaidModule["default"]> {
  if (!mermaidCache) {
    const mod = await import("mermaid");
    mermaidCache = mod.default;
  }
  mermaidCache.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "base",
    themeVariables: isDark
      ? {
          primaryColor: "#3b82f6",
          primaryTextColor: "#f9fafb",
          primaryBorderColor: "#1d4ed8",
          lineColor: "#9ca3af",
          background: "#111827",
          mainBkg: "#1e293b",
          nodeBorder: "#3b82f6",
          clusterBkg: "#1e293b",
          titleColor: "#f9fafb",
          edgeLabelBackground: "#374151",
          tertiaryColor: "#374151",
        }
      : {
          primaryColor: "#3b82f6",
          primaryTextColor: "#fff",
          primaryBorderColor: "#2563eb",
          lineColor: "#6b7280",
          background: "#f9fafb",
          mainBkg: "#eff6ff",
          nodeBorder: "#3b82f6",
          clusterBkg: "#f0f9ff",
          titleColor: "#1e3a5f",
          edgeLabelBackground: "#f3f4f6",
          tertiaryColor: "#f0fdf4",
        },
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: 14,
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
    sequence: { useMaxWidth: true },
    er: { useMaxWidth: true },
  });
  return mermaidCache;
}

let idCounter = 0;

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const idRef = useRef(`mermaid-${++idCounter}`);

  useEffect(() => {
    let cancelled = false;
    setSvg("");
    setError("");

    getMermaid(isDark)
      .then(async (m) => {
        try {
          const uniqueId = `${idRef.current}-${Date.now()}`;
          const { svg: rendered } = await m.render(uniqueId, chart.trim());
          if (!cancelled) setSvg(rendered);
        } catch (e) {
          if (!cancelled) {
            setError(`Render error: ${String(e).slice(0, 120)}`);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(`Load error: ${String(e).slice(0, 120)}`);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, isDark]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Failed to render diagram</p>
        <pre className="text-xs text-red-600 dark:text-red-500 overflow-auto font-mono whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl h-56" />
    );
  }

  return (
    <div
      className="overflow-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:block"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
