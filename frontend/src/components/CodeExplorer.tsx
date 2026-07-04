import React, { useState } from "react";
import { FileNode } from "../types";
import { 
  FileCode, 
  Terminal, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Cpu, 
  BookOpen, 
  Flame,
  FileCheck
} from "lucide-react";

interface CodeExplorerProps {
  files: Array<{ path: string; content: string }>;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  fileTree: FileNode;
}

export default function CodeExplorer({
  files,
  selectedPath,
  onSelectPath,
  fileTree
}: CodeExplorerProps) {
  const [activeTab, setActiveTab] = useState<"code" | "explanation">("code");

  // Locate current file details in fileTree to get LOC/Complexity metrics
  const findFileNode = (node: FileNode, targetPath: string): FileNode | null => {
    if (node.path === targetPath) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findFileNode(child, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFile = files.find(f => f.path === selectedPath) || files[0];
  const fileMetric = currentFile ? findFileNode(fileTree, currentFile.path) : null;

  // Simple custom regex high-fidelity syntax highlighter for a beautiful IDE experience
  const highlightCode = (code: string, language: string = "typescript") => {
    if (!code) return "";
    
    // Escape HTML special characters first
    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // JS/TS, CSS or Python formatting
    const isPython = language.toLowerCase() === "python" || currentFile?.path.endsWith(".py");
    
    if (isPython) {
      escaped = escaped
        // Keywords
        .replace(/\b(def|class|import|from|as|return|if|else|elif|for|while|in|and|or|not|try|except|pass|lambda|None|True|False)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
        // Functions
        .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="text-sky-400">$1</span>')
        // Comments
        .replace(/(#.*)/g, '<span class="text-slate-500 italic">$1</span>')
        // Strings
        .replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>');
    } else {
      escaped = escaped
        // ES Module Imports & Variable keywords
        .replace(/\b(import|from|export|default|const|let|var|function|return|class|extends|interface|type|public|private|async|await)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
        // Built-ins or browser keywords
        .replace(/\b(console|log|error|window|document|process|env|mongoose|express|require|module)\b/g, '<span class="text-teal-400 font-medium">$1</span>')
        // Control flow
        .replace(/\b(if|else|for|while|switch|case|break|try|catch|finally|throw|new|then|finally)\b/g, '<span class="text-indigo-400">$1</span>')
        // Comments
        .replace(/(\/\/.*)/g, '<span class="text-slate-500 italic">$1</span>')
        // Strings
        .replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(`[^`]*`)/g, '<span class="text-emerald-400">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>');
    }

    return escaped;
  };

  // Generate a dynamic explanatory breakdown for files
  const getFileExplanation = (path: string) => {
    const fileName = path.split("/").pop() || "";
    
    if (path.includes("weatherApi") || path.includes("services")) {
      return {
        role: "Data Client / API Gateway Layer",
        overview: `The file \`${fileName}\` functions as the remote connector connecting CodeAtlas with external weather providers. It encapsulates network fetching, queries, token integrations, and data formatting pipelines.`,
        hotspots: "Minimal cognitive load. Highly stateless and modular.",
        improvements: "Encourage error retry handlers and dynamic rate limit buffering."
      };
    }
    if (path.includes("Card") || path.includes("components") || path.includes("Grid") || path.includes("SearchBar")) {
      return {
        role: "Modular UI View Component",
        overview: `The file \`${fileName}\` is a stateless visual element in charge of data layouts and styling. It consumes properties dynamically and uses Tailwind layouts for crisp responsive spacing.`,
        hotspots: "Low cognitive load. Highly visual render layout.",
        improvements: "Add strict typing interfaces to validate optional property layouts (defend against null-pointers)."
      };
    }
    if (path.includes("auth") || path.includes("User")) {
      return {
        role: "Authentication Gateway / Schema Controller",
        overview: `The file \`${fileName}\` operates at the secure core of the server. It handles crypto routines (bcryptjs hashing), access token triggers (JWT sign routines), and schema bindings (User models).`,
        hotspots: "Moderate-to-High. Encryption loops block execution if round limits are too elevated.",
        improvements: "Abstract secrets to separate environments, and throttle repeated login failures (prevent dictionary attacks)."
      };
    }
    if (path.includes("app.py") || path.includes("server.js") || path.includes("main.tsx") || path.includes("App.tsx")) {
      return {
        role: "Main Service / State Coordinator",
        overview: `The file \`${fileName}\` represents the central router and orchestrator of this application. It binds core layout modules, coordinates primary states, and maps data flows to appropriate routes.`,
        hotspots: "Moderate. High import volumes make it prone to tight coupling.",
        improvements: "Separate logic utilities out into dedicated folders (like \`src/utils\` or \`src/hooks\`) to lower the file weight."
      };
    }
    return {
      role: "Application Module",
      overview: `The file \`${fileName}\` carries functional procedures and static code logic. It acts as an integral connector in the runtime chain.`,
      hotspots: "Varies depending on dependency and nested loop counts.",
      improvements: "Isolate functions, enforce unit coverage, and keep file sizes under 150 lines."
    };
  };

  const fileExplanation = currentFile ? getFileExplanation(currentFile.path) : getFileExplanation("App.tsx");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px]">
      
      {/* Left panel: File navigation index */}
      <div className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-4 overflow-y-auto shrink-0 flex md:flex-col gap-2">
        <div className="hidden md:block mb-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
            Project Files
          </span>
        </div>
        <div className="flex md:flex-col gap-2 w-full overflow-x-auto md:overflow-x-visible">
          {files.map((file, idx) => {
            const isSelected = selectedPath === file.path || (!selectedPath && idx === 0);
            return (
              <button
                key={file.path + idx}
                onClick={() => onSelectPath(file.path)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs rounded-xl font-medium cursor-pointer transition-all shrink-0 text-left w-full ${
                  isSelected
                    ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Editor / Viewer workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
        
        {/* Editor Tab Headers */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Terminal className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-slate-100 truncate">
                {currentFile ? currentFile.path : "Code Viewer"}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {fileMetric?.loc || currentFile?.content.split("\n").length || 0} Lines of Code • Complexity rating: {fileMetric?.complexity || 1}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                activeTab === "code"
                  ? "bg-slate-800 text-indigo-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Source Code
            </button>
            <button
              onClick={() => setActiveTab("explanation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                activeTab === "explanation"
                  ? "bg-slate-800 text-indigo-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Explanation
            </button>
          </div>
        </div>

        {/* Content Viewer body */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          {activeTab === "code" ? (
            <div className="flex font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto select-text">
              {/* Line Numbers column */}
              <div className="text-slate-600 text-right pr-4 select-none border-r border-slate-800/80 shrink-0 flex flex-col">
                {currentFile?.content.split("\n").map((_, i) => (
                  <span key={i} className="block w-6 text-slate-600 select-none">
                    {i + 1}
                  </span>
                )) || <span>1</span>}
              </div>

              {/* Styled Syntax Highlighting code block */}
              <pre className="pl-4 pr-2 flex-1 overflow-x-auto">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(currentFile?.content || "", currentFile?.path.split(".").pop())
                  }}
                />
              </pre>
            </div>
          ) : (
            /* AI explanation panel */
            <div className="p-4 space-y-6">
              
              <div className="flex items-start gap-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Architectural Role</h4>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{fileExplanation.role}</p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {fileExplanation.overview}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hotspot evaluation */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Cognitive Load Hotspot</h5>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {fileExplanation.hotspots}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Refactoring Suggestion</h5>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {fileExplanation.improvements}
                    </p>
                  </div>
                </div>
              </div>

              {/* General details footer */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <Info className="w-4 h-4 shrink-0 text-slate-600" />
                <span>Code summaries are formulated dynamically using static patterns and structural parsing models.</span>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
