import React, { useState } from "react";
import { RepositoryAnalysis } from "./types";
import { analyzeRepository } from "./api";
import CodeAtlasMap from "./components/CodeAtlasMap";
import MetricsDashboard from "./components/MetricsDashboard";
import CodeExplorer from "./components/CodeExplorer";
import QualityAuditor from "./components/QualityAuditor";
import AnalysisLauncher from "./components/AnalysisLauncher";
import { 
  Map, 
  Terminal, 
  ShieldAlert, 
  Layers, 
  Info,
  FileCode,
  Hammer,
  ListChecks,
  Sparkles
} from "lucide-react";

export default function App() {
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visualizer" | "editor" | "auditor">("visualizer");

  const handleAnalyzeRepository = async (repoUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveTab("visualizer");

    try {
      const result = await analyzeRepository(repoUrl);
      setAnalysis(result);
      setSelectedFilePath(result.importantFiles[0] ? `/${result.importantFiles[0]}` : null);
    } catch (error: any) {
      console.error("Analysis transmission failed:", error);
      setErrorMessage(`Failed to analyze repository. ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const atlasData = analysis?.atlasData;
  const projectFiles =
    analysis?.importantFiles.map((path) => ({
      path: path.startsWith("/") ? path : `/${path}`,
      content: `Analysis artifact for ${path}\n\n${analysis.aiSummary}`,
    })) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Decorative ambient glowing grids in margins */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Top Header Banner */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Brand Logo and descriptive subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/10 border border-indigo-400/20">
              <Layers className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
                  Code<span className="text-indigo-400">Atlas</span>
                </h1>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full font-mono border border-slate-800">
                  FastAPI Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Repository intelligence powered by the existing backend</p>
            </div>
          </div>

          {/* Core Navigation tabs */}
          <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-850">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "visualizer"
                  ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Map className="w-4 h-4" />
              Atlas Visualizer
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "editor"
                  ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-4 h-4" />
              File Inspector (IDE)
            </button>
            <button
              onClick={() => setActiveTab("auditor")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "auditor"
                  ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Quality Auditor
            </button>
          </div>

        </div>
      </header>

      {/* Primary Container layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 relative">
        
        {/* Connection Failure Error Panel */}
        {errorMessage && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-200 rounded-2xl text-xs flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Controller room workspace launcher */}
        <AnalysisLauncher
          onAnalyzeRepository={handleAnalyzeRepository}
          isLoading={isLoading}
        />

        {/* 2. Workspace Tabs Display */}
        {!isLoading && atlasData && analysis && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-slate-300">AI Summary</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.aiSummary}</p>
                <p className="text-[11px] text-slate-500 mt-4 font-mono break-all">{analysis.repoUrl}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-slate-300">Languages</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.languages.map((language) => (
                    <span key={language} className="text-xs text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Hammer className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-300">Build Files</h2>
                  </div>
                  <div className="space-y-2">
                    {analysis.buildFiles.map((file) => (
                      <p key={file} className="text-xs text-slate-300 font-mono bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                        {file}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-300">Important Files</h2>
                  </div>
                  <div className="space-y-2">
                    {analysis.importantFiles.map((file) => (
                      <button
                        key={file}
                        onClick={() => {
                          setSelectedFilePath(file.startsWith("/") ? file : `/${file}`);
                          setActiveTab("editor");
                        }}
                        className="w-full text-left text-xs text-slate-300 font-mono bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg px-3 py-2 transition"
                      >
                        {file}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Visualizer Block */}
            {activeTab === "visualizer" && (
              <div className="space-y-6">
                {/* Visualizer Grid layout */}
                <CodeAtlasMap
                  fileTree={atlasData.fileTree}
                  dependencies={atlasData.dependencies}
                  architecture={atlasData.architectureDiagram}
                  onSelectFile={(path) => {
                    setSelectedFilePath(path);
                    setActiveTab("editor");
                  }}
                  selectedFilePath={selectedFilePath}
                />

                {/* Dashboard Metrics Reports */}
                <MetricsDashboard
                  summary={atlasData.summary}
                  hotspots={atlasData.hotspots}
                  fileTree={atlasData.fileTree}
                  onSelectFile={(path) => {
                    setSelectedFilePath(path);
                    setActiveTab("editor");
                  }}
                />
              </div>
            )}

            {/* Split Screen Code inspector IDE Block */}
            {activeTab === "editor" && (
              <CodeExplorer
                files={projectFiles}
                selectedPath={selectedFilePath}
                onSelectPath={(path) => setSelectedFilePath(path)}
                fileTree={atlasData.fileTree}
              />
            )}

            {/* Quality Auditor and Smell reports block */}
            {activeTab === "auditor" && (
              <QualityAuditor
                report={atlasData.qualityReport}
                onSelectFile={(path) => {
                  setSelectedFilePath(path);
                  setActiveTab("editor");
                }}
              />
            )}

          </div>
        )}

      </main>

      {/* Humble Footer in page margin */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950/60 text-center text-[10px] text-slate-600 mt-auto shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>CodeAtlas Static Code Analytics System • Connected to FastAPI backend</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-slate-400 transition cursor-help">
              <Info className="w-3.5 h-3.5" />
              API documentation
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
