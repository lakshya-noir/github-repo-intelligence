import React, { useState } from "react";
import { QualityReport, CodeSmell } from "../types";
import { 
  ShieldAlert, 
  Zap, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Wrench, 
  AlertTriangle,
  Lightbulb,
  FileCode
} from "lucide-react";

interface QualityAuditorProps {
  report: QualityReport;
  onSelectFile: (path: string) => void;
}

export default function QualityAuditor({
  report,
  onSelectFile
}: QualityAuditorProps) {
  const [expandedSmell, setExpandedSmell] = useState<number | null>(null);

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "security":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "performance":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "typescript": case "types":
        return <FileCode className="w-4 h-4 text-sky-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": case "critical":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "medium": case "warning":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
  };

  // Pre-designed visual code comparisons to display inside expanded code smells
  const getRefactorAdvice = (message: string) => {
    const isSecret = message.toLowerCase().includes("secret") || message.toLowerCase().includes("key");
    const isTypes = message.toLowerCase().includes("type") || message.toLowerCase().includes("implicit");
    const isComplexity = message.toLowerCase().includes("complexity") || message.toLowerCase().includes("nested");

    if (isSecret) {
      return {
        bad: `// services/apiClient.ts\nconst API_KEY = 'hardcoded_secret_value';\nconst BASE_URL = 'https://api.example.com';`,
        good: `// services/apiClient.ts\nconst API_KEY = import.meta.env.VITE_SERVICE_API_KEY;\nconst BASE_URL = import.meta.env.VITE_SERVICE_BASE_URL;`,
        tip: "Inject dynamic API variables through .env structures. Never hardcode credentials into public code."
      };
    }
    if (isTypes) {
      return {
        bad: `// ❌ components/WeatherCard.tsx\nexport default function WeatherCard({ current }) {\n  return <div>{current.temp}</div>;\n}`,
        good: `// ✅ components/WeatherCard.tsx\ninterface WeatherCardProps {\n  current: { temp: number; condition: string };\n}\n\nexport default function WeatherCard({ current }: WeatherCardProps) {\n  return <div>{current.temp}</div>;\n}`,
        tip: "Use explicit interfaces for component properties. Destructures without types trigger implicit 'any' warnings."
      };
    }
    if (isComplexity) {
      return {
        bad: `// ❌ analytics.py\ndef compute_metrics(log_payload):\n    if latency > 1000:\n        score -= 50\n    elif latency > 500:\n        score -= 20\n    else:\n        score = 100`,
        good: `// ✅ analytics.py\nLATENCY_TIERS = [(1000, 50), (500, 20)]\n\ndef compute_metrics(log_payload):\n    score = 100\n    for limit, penalty in LATENCY_TIERS:\n        if latency > limit:\n            return score - penalty\n    return score`,
        tip: "Abstract linear metric scales to mapping tuples. This cleans nested branches and keeps complexity flat."
      };
    }

    return {
      bad: `// ❌ Original Implementation\nconst results = computeData(raw);\nreturn results;`,
      good: `// ✅ Optimized Implementation\nconst results = useMemo(() => computeData(raw), [raw]);\nreturn results;`,
      tip: "Leverage standard React caching Hooks (useMemo, useCallback) on loops and arrays to limit execution redraws."
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left panel: Active Code Smells listing (8 cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5.5 h-5.5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Code Smell Auditor</h3>
              <p className="text-xs text-slate-500 mt-0.5">Locate anti-patterns, security risks, and type exceptions</p>
            </div>
          </div>
          <span className="text-xs bg-slate-950 font-mono text-slate-400 border border-slate-800 px-3 py-1 rounded-xl">
            {report.codeSmells.length} Smells Detected
          </span>
        </div>

        {/* Scrollable list of issues */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
          {report.codeSmells.map((smell, idx) => {
            const isExpanded = expandedSmell === idx;
            const advice = getRefactorAdvice(smell.message);

            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "bg-slate-950/60 border-indigo-500/40 shadow-lg"
                    : "bg-slate-950/20 hover:bg-slate-950/40 border-slate-800"
                }`}
              >
                {/* Header panel (always visible) */}
                <div
                  onClick={() => setExpandedSmell(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 truncate">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(smell.category)}
                    </div>
                    <div className="truncate">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {smell.message}
                        </span>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${getSeverityBadge(smell.severity)}`}>
                          {smell.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                        File: {smell.file.replace(/^\//, "")} • Line {smell.line}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-500 hover:text-slate-300 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Body panel (shown on click) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-800/80 pt-4 bg-slate-950/90 text-xs">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      {/* Original Code Box */}
                      <div className="flex-1">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block mb-1.5">Original Issue</span>
                        <pre className="p-3 bg-red-950/10 border border-red-900/20 text-red-200 font-mono text-[11px] rounded-lg overflow-x-auto">
                          <code>{advice.bad}</code>
                        </pre>
                      </div>

                      {/* Clean Code Box */}
                      <div className="flex-1">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1.5">Refactored Solution</span>
                        <pre className="p-3 bg-emerald-950/10 border border-emerald-900/20 text-emerald-200 font-mono text-[11px] rounded-lg overflow-x-auto">
                          <code>{advice.good}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                      <Wrench className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200 block">AI Recommendation:</span>
                        <p className="mt-0.5 leading-normal">{advice.tip}</p>
                      </div>
                    </div>

                    <div className="mt-3.5 flex justify-end">
                      <button
                        onClick={() => onSelectFile(smell.file)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Inspect File in Explorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Static Refactoring Suggestions Advisory (4 cols) */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px] justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-5 shrink-0">
            <Lightbulb className="w-5.5 h-5.5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Refactoring Advisor</h3>
              <p className="text-xs text-slate-500 mt-0.5">AI-backed strategic recommendations</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {report.suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 hover:border-slate-800 transition"
              >
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  {sug.title}
                </span>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {sug.description}
                </p>
                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded inline-block font-mono">
                  Benefit: {sug.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 mt-4 text-[10px] text-slate-500 flex items-center gap-2">
          <Wrench className="w-4.5 h-4.5 text-slate-600 shrink-0" />
          <span>Suggestions focus on lower file size ratios, lower cyclic branches, and modular reusability.</span>
        </div>
      </div>

    </div>
  );
}
