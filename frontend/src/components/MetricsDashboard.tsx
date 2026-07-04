import React from "react";
import { CodeAtlasSummary, Hotspot, FileNode } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { 
  Activity, 
  Percent, 
  Cpu, 
  Layout, 
  BarChart3, 
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface MetricsDashboardProps {
  summary: CodeAtlasSummary;
  hotspots: Hotspot[];
  fileTree: FileNode;
  onSelectFile: (path: string) => void;
}

export default function MetricsDashboard({
  summary,
  hotspots,
  fileTree,
  onSelectFile
}: MetricsDashboardProps) {

  // Flatten files for charting lines of code
  const getFlatFiles = (node: FileNode): Array<{ name: string; loc: number; complexity: number; path: string }> => {
    let files: Array<{ name: string; loc: number; complexity: number; path: string }> = [];
    if (node.type === "file") {
      files.push({
        name: node.name,
        loc: node.loc || 0,
        complexity: node.complexity || 1,
        path: node.path
      });
    } else if (node.children) {
      node.children.forEach(child => {
        files = [...files, ...getFlatFiles(child)];
      });
    }
    return files;
  };

  const fileData = getFlatFiles(fileTree)
    .sort((a, b) => b.loc - a.loc)
    .slice(0, 8); // Top 8 files for readable charting

  // Compute maintenance level description and colors
  const getScoreDetails = (score: number) => {
    if (score >= 90) return { label: "Excellent Maintainability", desc: "Codebase is highly modular, easy to refactor, and self-documenting.", color: "text-emerald-400", border: "border-emerald-500/20", bg: "from-emerald-500/10 to-transparent", stroke: "#10b981" };
    if (score >= 75) return { label: "Good Structure", desc: "Minor code smells found; overall structure is healthy and reusable.", color: "text-indigo-400", border: "border-indigo-500/20", bg: "from-indigo-500/10 to-transparent", stroke: "#6366f1" };
    if (score >= 60) return { label: "Moderate Debt", desc: "Some cognitive complexity hotspots. Refactoring of primary state routers recommended.", color: "text-amber-400", border: "border-amber-500/20", bg: "from-amber-500/10 to-transparent", stroke: "#f59e0b" };
    return { label: "High Risk / Critical", desc: "High complexity layers and security warnings detected. Strict visual inspection needed.", color: "text-rose-400", border: "border-rose-500/20", bg: "from-rose-500/10 to-transparent", stroke: "#f43f5e" };
  };

  const scoreDetails = getScoreDetails(summary.maintainabilityScore);

  // Language colors configuration
  const getLangColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "typescript": case "ts": return "bg-indigo-500";
      case "javascript": case "js": return "bg-yellow-500";
      case "css": return "bg-blue-500";
      case "html": return "bg-orange-500";
      case "python": case "py": return "bg-emerald-400";
      case "json": return "bg-teal-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Radial Maintainability Score Dial Card */}
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-[360px] relative overflow-hidden bg-gradient-to-br ${scoreDetails.bg}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-300">Maintainability Index</h3>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            HALSTEAD INDEX
          </span>
        </div>

        {/* Center Gauge dial built with SVG */}
        <div className="my-auto flex flex-col items-center justify-center relative">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Value Arc progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={scoreDetails.stroke}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - summary.maintainabilityScore / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              transform="rotate(-90 50 50)"
            />
            {/* Dial Text */}
            <text
              x="50"
              y="53"
              textAnchor="middle"
              className="fill-slate-100 text-2xl font-mono font-bold"
              fontSize="18"
            >
              {summary.maintainabilityScore}%
            </text>
          </svg>
          <p className={`text-md font-bold mt-2.5 ${scoreDetails.color}`}>{scoreDetails.label}</p>
        </div>

        <div>
          <p className="text-xs text-slate-400 leading-relaxed text-center px-2">
            {scoreDetails.desc}
          </p>
        </div>
      </div>

      {/* 2. Top Files LOC Distribution Histogram Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[360px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-300">Lines of Code Distribution</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">LOC / file</span>
        </div>

        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fileData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                itemStyle={{ color: "#e2e8f0", fontSize: "12px" }}
                labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                cursor={{ fill: "rgba(51, 65, 85, 0.2)" }}
              />
              <Bar dataKey="loc" radius={[0, 4, 4, 0]}>
                {fileData.map((entry, index) => {
                  const isHot = entry.complexity > 5;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isHot ? "url(#locGradHot)" : "url(#locGradNorm)"} 
                      onClick={() => onSelectFile(entry.path)}
                      className="cursor-pointer"
                    />
                  );
                })}
              </Bar>
              {/* Gradients declaration inside svg elements */}
              <defs>
                <linearGradient id="locGradNorm" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="locGradHot" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-slate-500 font-medium text-center mt-2">
          Click any bar to instantly load and inspect its static code file.
        </p>
      </div>

      {/* 3. Hotspot Code Analysis & Language Shares */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[360px] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-300">File Hotspot Report</h3>
            </div>
            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-semibold">
              {hotspots.length} Alerts
            </span>
          </div>

          {/* List of active hotspot items */}
          <div className="space-y-3.5 max-h-[185px] overflow-y-auto pr-1">
            {hotspots.map((hot, idx) => (
              <div
                key={hot.path + idx}
                onClick={() => onSelectFile(hot.path)}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">{hot.path.replace(/^\//, "")}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      hot.severity === "high" 
                        ? "bg-red-500/10 text-red-400" 
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {hot.severity}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      Score: {hot.score}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                  {hot.reason}
                </p>
              </div>
            ))}
            {hotspots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-medium">No active file hotspot alerts detected!</p>
              </div>
            )}
          </div>
        </div>

        {/* Language Breakdown Progress Multi-segment bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Primary: {summary.primaryLanguage}</span>
            <span>Complexity: {summary.averageComplexity} / 10 max</span>
          </div>
          
          {/* Progress bar container */}
          <div className="h-2 w-full bg-slate-850 rounded-full flex overflow-hidden">
            {Object.entries(summary.languages).map(([lang, pct]) => (
              <div
                key={lang}
                className={`h-full ${getLangColor(lang)} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${lang}: ${pct}%`}
              />
            ))}
          </div>

          {/* Color keys legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            {Object.entries(summary.languages).map(([lang, pct]) => (
              <div key={lang} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className={`w-2 h-2 rounded-full ${getLangColor(lang)}`} />
                <span>{lang} ({pct}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
