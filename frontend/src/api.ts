import { BackendAnalysisResponse, CodeAtlasData, FileNode, RepositoryAnalysis } from "./types";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const languagePercentages = (languages: string[]) => {
  if (languages.length === 0) return { Unknown: 100 };

  const share = Math.floor(100 / languages.length);
  const entries = languages.map((language, index) => [
    language,
    index === languages.length - 1 ? 100 - share * (languages.length - 1) : share,
  ]);

  return Object.fromEntries(entries);
};

const nodeForPath = (path: string, language?: string): FileNode => ({
  name: path.split("/").pop() || path,
  type: "file",
  path: path.startsWith("/") ? path : `/${path}`,
  loc: 0,
  complexity: 1,
  language,
});

const buildFileTree = (response: BackendAnalysisResponse): FileNode => {
  const seen = new Set<string>();
  const files = [...response.important_files, ...response.build_files]
    .filter((path) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    })
    .map((path) => nodeForPath(path, response.languages[0]));

  return {
    name: response.repo_path.split("/").pop() || "repository",
    type: "directory",
    path: "/",
    children: files.length > 0 ? files : [nodeForPath("README.md", response.languages[0])],
  };
};

const toAtlasData = (response: BackendAnalysisResponse): CodeAtlasData => {
  const primaryLanguage = response.languages[0] || "Unknown";
  const fileTree = buildFileTree(response);

  return {
    summary: {
      totalFiles: response.important_files.length,
      totalLOC: 0,
      primaryLanguage,
      languages: languagePercentages(response.languages),
      maintainabilityScore: 100,
      averageComplexity: 0,
      architecturalStyle: "Repository Analysis",
      overallHealth: response.status === "success" ? "Analyzed" : "Unknown",
    },
    fileTree,
    dependencies: [],
    hotspots: response.important_files.map((path) => ({
      path: path.startsWith("/") ? path : `/${path}`,
      reason: "Important file identified by the backend analysis.",
      severity: "low",
      score: 10,
    })),
    qualityReport: {
      codeSmells: [],
      suggestions: [
        {
          title: "AI Repository Summary",
          description: response.summary || "No summary was returned by the backend.",
          benefit: "Use this as the starting point for understanding the repository.",
        },
      ],
    },
    architectureDiagram: {
      nodes: [
        { id: "repo", label: response.repo_path || "Repository", type: "entry" },
        ...response.languages.map((language) => ({
          id: `language-${language}`,
          label: language,
          type: "utility",
        })),
      ],
      links: response.languages.map((language) => ({
        source: "repo",
        target: `language-${language}`,
      })),
    },
  };
};

export async function analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repo_url: repoUrl }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : `Backend returned ${response.status}`;
    throw new Error(message);
  }

  const analysis = payload as BackendAnalysisResponse;

  if (!analysis || analysis.status !== "success") {
    throw new Error("The backend did not return a successful repository analysis.");
  }

  return {
    repoUrl,
    repoPath: analysis.repo_path,
    languages: analysis.languages,
    buildFiles: analysis.build_files,
    importantFiles: analysis.important_files,
    aiSummary: analysis.summary,
    atlasData: toAtlasData(analysis),
  };
}
