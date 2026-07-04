import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Github,
  Link,
  Server,
  Sparkles,
} from "lucide-react";

interface AnalysisLauncherProps {
  onAnalyzeRepository: (repoUrl: string) => Promise<void>;
  isLoading: boolean;
}

export default function AnalysisLauncher({
  onAnalyzeRepository,
  isLoading,
}: AnalysisLauncherProps) {
  const [repoUrl, setRepoUrl] = useState("https://github.com/psf/requests.git");
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingStepsTexts = [
    "Connecting to FastAPI backend...",
    "Cloning repository through the backend...",
    "Detecting languages and build files...",
    "Finding important repository files...",
    "Waiting for AI-generated summary...",
    "Rendering CodeAtlas results...",
  ];

  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingStepsTexts.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) return;
    onAnalyzeRepository(trimmedUrl);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800 relative">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            CodeAtlas Control Room
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Paste a GitHub repository URL and run the existing FastAPI analysis pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <Server className="w-3.5 h-3.5" />
          Backend: /analyze
        </div>
      </div>

      {isLoading ? (
        <div className="py-14 flex flex-col items-center justify-center relative min-h-[220px]">
          <div className="relative mb-6">
            <div className="w-14 h-14 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
            <Activity className="absolute inset-0 m-auto w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Analyzing Repository...</p>
          <p className="text-xs text-slate-500 mt-1.5 font-mono animate-pulse">
            {loadingStepsTexts[loadingStep]}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                GitHub Repository URL
              </label>
              <div className="relative">
                <Link className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="https://github.com/owner/repository.git"
                  required
                />
              </div>
            </div>

            <div className="lg:col-span-4 flex items-end">
              <button
                type="submit"
                disabled={!repoUrl.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-xl font-semibold text-xs transition cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Analyze Repository
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <Github className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The frontend sends <span className="font-mono text-slate-300">repo_url</span> to the configured backend and displays the real response.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
