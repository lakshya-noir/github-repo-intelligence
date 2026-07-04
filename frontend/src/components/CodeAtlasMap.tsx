import React, { useState, useRef, useEffect } from "react";
import { FileNode, Dependency, ArchitectureDiagram } from "../types";
import { 
  Folder, 
  File, 
  Code, 
  Layers, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Search,
  CheckCircle,
  AlertTriangle,
  Flame,
  MousePointerClick
} from "lucide-react";

interface CodeAtlasMapProps {
  fileTree: FileNode;
  dependencies: Dependency[];
  architecture: ArchitectureDiagram;
  onSelectFile: (path: string) => void;
  selectedFilePath: string | null;
}

export default function CodeAtlasMap({
  fileTree,
  dependencies,
  architecture,
  onSelectFile,
  selectedFilePath
}: CodeAtlasMapProps) {
  const [viewMode, setViewMode] = useState<"explorer" | "architecture">("explorer");
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tree files based on search
  const matchesSearch = (node: FileNode, term: string): boolean => {
    if (!term) return true;
    if (node.name.toLowerCase().includes(term.toLowerCase()) || node.path.toLowerCase().includes(term.toLowerCase())) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => matchesSearch(child, term));
    }
    return false;
  };

  // Helper to flatten files for list and heatmap
  const getFlatFiles = (node: FileNode): FileNode[] => {
    let files: FileNode[] = [];
    if (node.type === "file") {
      files.push(node);
    } else if (node.children) {
      node.children.forEach(child => {
        files = [...files, ...getFlatFiles(child)];
      });
    }
    return files;
  };

  const flatFiles = getFlatFiles(fileTree);
  const filteredFiles = flatFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render tree node recursive component
  const RenderTreeNode = ({ node, depth = 0 }: { node: FileNode; depth: number }) => {
    const isFolder = node.type === "directory";
    const isSelected = selectedFilePath === node.path;
    const [isOpen, setIsOpen] = useState(true);

    if (searchTerm && !matchesSearch(node, searchTerm)) return null;

    return (
      <div className="select-none">
        <div
          onClick={() => {
            if (isFolder) {
              setIsOpen(!isOpen);
            } else {
              onSelectFile(node.path);
            }
          }}
          className={`flex items-center justify-between py-2.5 px-3.5 my-1 rounded-xl transition-all duration-200 cursor-pointer ${
            isSelected 
              ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200 font-medium" 
              : "hover:bg-slate-800/60 border border-transparent text-slate-300"
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 18)}px` }}
        >
          <div className="flex items-center gap-3 truncate">
            {isFolder ? (
              <Folder className={`w-4.5 h-4.5 ${isOpen ? "text-indigo-400" : "text-indigo-400/70"}`} />
            ) : (
              <File className={`w-4.5 h-4.5 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
            )}
            <span className="text-sm truncate">{node.name}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500 shrink-0">
            {node.loc && (
              <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                {node.loc} LOC
              </span>
            )}
            {node.complexity && (
              <span className={`px-2 py-0.5 rounded-md font-mono border ${
                node.complexity > 5 
                  ? "bg-red-500/10 border-red-500/20 text-red-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                C: {node.complexity}
              </span>
            )}
          </div>
        </div>

        {isFolder && isOpen && node.children && (
          <div className="relative">
            <div className="absolute left-[21px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-slate-700/50 to-slate-800/10" style={{ left: `${depth * 18 + 21}px` }} />
            {node.children.map((child, idx) => (
              <div key={`${child.path}-${idx}`}>
                <RenderTreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Drag and zoom support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "architecture") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev * factor)));
  };

  const resetCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node position calculation for SVG rendering
  const getNodeCoordinates = (index: number, total: number) => {
    const radius = 170; // Orbit radius
    const centerX = 350;
    const centerY = 240;
    if (total <= 1) return { x: centerX, y: centerY };
    
    // Distribute nodes in a circle
    const angle = (index / total) * 2 * Math.PI;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const getArchColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "entry": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", fill: "#10b981" };
      case "router": case "route": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", fill: "#f59e0b" };
      case "component": return { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", fill: "#6366f1" };
      case "utility": return { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400", fill: "#0ea5e9" };
      case "database": return { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", fill: "#f43f5e" };
      default: return { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", fill: "#94a3b8" };
    }
  };

  // Connect node coordinates for drawing SVG links
  const renderedNodes = architecture.nodes.map((node, idx) => {
    const coords = getNodeCoordinates(idx, architecture.nodes.length);
    return {
      ...node,
      ...coords,
      style: getArchColor(node.type)
    };
  });

  return (
    <div id="codeatlas-workspace" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
      {/* Visual Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Codebase Atlas Map
            </h2>
            <p className="text-xs text-slate-500">Explore recursive visual hierarchies and module connections</p>
          </div>
        </div>

        {/* Workspace Toggle Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode("explorer")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              viewMode === "explorer"
                ? "bg-slate-800 text-indigo-300 border border-slate-700/50 shadow-inner"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-4 h-4" />
            File Tree Explorer
          </button>
          <button
            onClick={() => setViewMode("architecture")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              viewMode === "architecture"
                ? "bg-slate-800 text-indigo-300 border border-slate-700/50 shadow-inner"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-4 h-4" />
            Architecture Graph
          </button>
        </div>
      </div>

      {/* Visual Workspace Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Navigation List (Shown in Explorer mode) */}
        {viewMode === "explorer" ? (
          <div className="flex flex-col md:flex-row w-full h-full divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Folder Tree Scroll Panel */}
            <div className="w-full md:w-5/12 p-4 flex flex-col h-1/2 md:h-full bg-slate-900/50">
              <div className="relative mb-3.5">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter codebase files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                <RenderTreeNode node={fileTree} depth={0} />
              </div>
            </div>

            {/* Quick Metrics & File Density Heatmap right panel */}
            <div className="w-full md:w-7/12 p-6 overflow-y-auto flex flex-col h-1/2 md:h-full bg-slate-900/10">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-300">File Hotspot & Density Heatmap</h3>
                <p className="text-xs text-slate-500 mt-1">Size reflects Lines of Code; Color density maps cyclomatic complexity.</p>
              </div>

              {/* Grid Density Heatmap */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
                {filteredFiles.map((file, idx) => {
                  const complexity = file.complexity || 1;
                  const isHot = complexity > 5;
                  const isSelected = selectedFilePath === file.path;

                  return (
                    <div
                      key={file.path + idx}
                      onClick={() => onSelectFile(file.path)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[105px] overflow-hidden ${
                        isSelected 
                          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-98" 
                          : ""
                      } ${
                        complexity > 6
                          ? "bg-red-950/20 hover:bg-red-950/30 border-red-900/30 hover:border-red-500/40"
                          : complexity > 3
                          ? "bg-amber-950/20 hover:bg-amber-950/30 border-amber-900/30 hover:border-amber-500/40"
                          : "bg-slate-800/30 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate pr-4">{file.name}</span>
                        {complexity > 5 ? (
                          <Flame className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">Complexity</span>
                          <span className={`text-sm font-mono font-bold ${
                            complexity > 6 ? "text-red-400" : complexity > 3 ? "text-amber-400" : "text-emerald-400"
                          }`}>{complexity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">Size</span>
                          <span className="text-xs font-mono font-medium text-slate-300">{file.loc} LOC</span>
                        </div>
                      </div>

                      {/* Hotspot indicator tab overlay */}
                      {complexity > 5 && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-bl-lg" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selection Prompt */}
              <div className="mt-auto bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <MousePointerClick className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Currently Selected File</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {selectedFilePath ? selectedFilePath.replace(/^\//, "") : "Choose a file to inspect code"}
                    </p>
                  </div>
                </div>
                {selectedFilePath && (
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md font-semibold select-none animate-pulse">
                    Active File
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* High-Fidelity Interactive Graph Mode */
          <div className="w-full h-full relative bg-slate-950 overflow-hidden">
            {/* Drag instructions / toolbar overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 shadow-lg">
              <span className="text-xs text-slate-400 font-medium mr-2">Controls:</span>
              <button onClick={() => handleZoom(1.15)} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => handleZoom(0.85)} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={resetCanvas} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition text-xs font-semibold" title="Reset view">
                Reset
              </button>
            </div>

            <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-500 font-mono">
              Drag to pan • Click node to highlight dependencies
            </div>

            {/* Interactive SVG Stage */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <svg className="w-full h-full">
                {/* Arrow markers for linkage flows */}
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" fillOpacity="0.4" />
                  </marker>
                  <marker
                    id="arrow-hover"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                  </marker>
                </defs>

                {/* Graph grouping with zoom and pan transformation */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Link renders */}
                  {architecture.links.map((link, idx) => {
                    const sourceNode = renderedNodes.find(n => n.id === link.source);
                    const targetNode = renderedNodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const isHighlight = hoveredNode === link.source || hoveredNode === link.target;

                    // Draw a smooth bezier curve for the connectors
                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Curve depth

                    return (
                      <path
                        key={`link-${idx}`}
                        d={`M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`}
                        fill="none"
                        stroke={isHighlight ? "#818cf8" : "#334155"}
                        strokeWidth={isHighlight ? 2 : 1}
                        strokeDasharray={isHighlight ? "none" : link.source === "main" ? "none" : "4,4"}
                        markerEnd={isHighlight ? "url(#arrow-hover)" : "url(#arrow)"}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Node renders */}
                  {renderedNodes.map((node, idx) => {
                    const isHovered = hoveredNode === node.id;
                    return (
                      <g
                        key={`node-${idx}`}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                      >
                        {/* Glow halo under hovered nodes */}
                        {isHovered && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={32}
                            fill={node.style.fill}
                            fillOpacity="0.15"
                            className="transition-all duration-300 animate-pulse"
                          />
                        )}

                        {/* Core Node Circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={18}
                          fill="#0f172a"
                          stroke={isHovered ? "#818cf8" : node.style.fill}
                          strokeWidth={isHovered ? 3 : 2}
                          className="transition-all duration-300"
                        />

                        {/* Internal Icon Circle indicator */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={6}
                          fill={node.style.fill}
                        />

                        {/* Label text */}
                        <text
                          x={node.x}
                          y={node.y + 36}
                          textAnchor="middle"
                          fill={isHovered ? "#f1f5f9" : "#94a3b8"}
                          fontSize={11}
                          fontWeight={isHovered ? "bold" : "normal"}
                          className="font-sans select-none drop-shadow-md transition-all duration-200"
                        >
                          {node.label}
                        </text>

                        {/* Smaller type indicator */}
                        <text
                          x={node.x}
                          y={node.y - 28}
                          textAnchor="middle"
                          fill={node.style.fill}
                          fontSize={8}
                          fontWeight="bold"
                          letterSpacing="0.05em"
                          className="font-mono uppercase select-none opacity-80"
                        >
                          {node.type || "module"}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
