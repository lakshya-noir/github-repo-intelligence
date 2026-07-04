export interface CodeAtlasSummary {
  totalFiles: number;
  totalLOC: number;
  primaryLanguage: string;
  languages: Record<string, number>;
  maintainabilityScore: number;
  averageComplexity: number;
  architecturalStyle?: string;
  overallHealth: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  loc?: number;
  complexity?: number;
  language?: string;
  children?: FileNode[];
}

export interface Dependency {
  source: string;
  target: string;
  type: 'import' | 'call' | 'external';
}

export interface Hotspot {
  path: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
}

export interface CodeSmell {
  file: string;
  line: number;
  severity: string;
  message: string;
  category?: string;
}

export interface Suggestion {
  title: string;
  description: string;
  benefit: string;
}

export interface QualityReport {
  codeSmells: CodeSmell[];
  suggestions: Suggestion[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type?: string;
}

export interface ArchitectureLink {
  source: string;
  target: string;
}

export interface ArchitectureDiagram {
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
}

export interface CodeAtlasData {
  summary: CodeAtlasSummary;
  fileTree: FileNode;
  dependencies: Dependency[];
  hotspots: Hotspot[];
  qualityReport: QualityReport;
  architectureDiagram: ArchitectureDiagram;
}

export interface BackendAnalysisResponse {
  status: string;
  repo_path: string;
  languages: string[];
  build_files: string[];
  important_files: string[];
  summary: string;
}

export interface RepositoryAnalysis {
  repoUrl: string;
  repoPath: string;
  languages: string[];
  buildFiles: string[];
  importantFiles: string[];
  aiSummary: string;
  atlasData: CodeAtlasData;
}
