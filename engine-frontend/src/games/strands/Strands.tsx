import React, { useState, useRef, useEffect } from "react";

type Node = {
  index: number;
  letter: string;
  x: number;
  y: number;
};

type Props = {
  letters?: string[];
};

const NODE_RADIUS = 26;

export default function CircularStrands({ letters = ["S", "T", "R", "A", "N", "D", "S", "W", "O", "R", "D", "S"] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 340, height: 340 });
  const [isDragging, setIsDragging] = useState(false);
  const [path, setPath] = useState<Node[]>([]);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const visited = useRef<Set<number>>(new Set());

  const radius = Math.min(size.width, size.height) * 0.36;

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const center = { x: size.width / 2, y: size.height / 2 };
  const angleStep = (2 * Math.PI) / letters.length;

  const nodes: Node[] = letters.map((letter, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      index: i,
      letter,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });

  const handleMouseDown = (node: Node) => {
    setIsDragging(true);
    setPath([node]);
    visited.current = new Set([node.index]);
  };

  const handleMouseEnter = (node: Node) => {
    if (!isDragging) return;
    const existingIndex = path.findIndex((n) => n.index === node.index);
    if (existingIndex !== -1) {
      const newPath = path.slice(0, existingIndex + 1);
      setPath(newPath);
      visited.current = new Set(newPath.map((n) => n.index));
      return;
    }
    visited.current.add(node.index);
    setPath((prev) => [...prev, node]);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const word = path.map((n) => n.letter).join("");
    if (word.length >= 3) {
      setCompletedWords((prev) => [...prev, word]);
    }
    setPath([]);
    visited.current.clear();
  };

  const currentWord = path.map((n) => n.letter).join("");
  const nodeSize = NODE_RADIUS * 2;

  // Line color: blue while dragging, fades to slate on complete
  const lineColor = "#3B82F6";

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 p-6 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header status bar */}
      <div className="flex items-center justify-between w-full max-w-sm mb-5">
        {/* Word count badge */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full text-white text-sm font-bold"
            style={{ width: 40, height: 40, background: "#3B82F6", border: "2px solid #2563EB" }}
          >
            {completedWords.length}
          </div>
          <span className="text-xs text-gray-600 font-medium">found</span>
        </div>

        {/* Live word display */}
        <div className="flex flex-col items-center gap-1">
          {currentWord.length > 0 ? (
            <>
              <span
                className="text-xl font-bold tracking-widest transition-all"
                style={{ color: "#1D4ED8", letterSpacing: "0.15em" }}
              >
                {currentWord}
              </span>
              <span className="text-xs font-semibold text-gray-700">{currentWord.length} letters</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-400">—</span>
              <span className="text-xs text-gray-600">drag to spell</span>
            </>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => setCompletedWords([])}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className="flex items-center justify-center rounded-full text-gray-400 text-sm transition-colors group-hover:text-gray-600"
            style={{ width: 40, height: 40, background: "#F3F4F6", border: "1.5px solid #E5E7EB" }}
          >
            ↺
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-600">reset</span>
        </button>
      </div>

      {/* Board */}
      <div
        className="relative rounded-2xl"
        style={{
          width: "100%",
          maxWidth: 380,
          aspectRatio: "1 / 1",
          background: "#F8F9FA",
          border: "1.5px solid #E5E7EB",
        }}
        ref={containerRef}
      >
        {/* SVG lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {path.map((node, i) => {
            if (i === 0) return null;
            const prev = path[i - 1];
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={node.x}
                y2={node.y}
                stroke={lineColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = path.some((p) => p.index === node.index);
          const isFirst = path[0]?.index === node.index;

          return (
            <div
              key={node.index}
              onMouseDown={() => handleMouseDown(node)}
              onMouseEnter={() => handleMouseEnter(node)}
              style={{
                position: "absolute",
                left: node.x - NODE_RADIUS,
                top: node.y - NODE_RADIUS,
                width: nodeSize,
                height: nodeSize,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 600,
                transition: "all 0.1s ease",
                background: isFirst
                  ? "#1D4ED8"
                  : isSelected
                  ? "#3B82F6"
                  : "#CBD5E1",
                color: isSelected ? "#fff" : "#475569",
                border: isSelected
                  ? "2px solid transparent"
                  : "2px solid transparent",
                boxShadow: isFirst
                  ? "0 0 0 3px #BFDBFE"
                  : isSelected
                  ? "0 0 0 2px #BFDBFE"
                  : "none",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                zIndex: isSelected ? 10 : 1,
              }}
            >
              {node.letter}
            </div>
          );
        })}
      </div>

      {/* Found words */}
      {completedWords.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-sm">
          {completedWords.map((word, i) => (
            <span
              key={i}
              className="text-xs font-semibold tracking-wider px-3 py-1 rounded-full"
              style={{
                background: "#EFF6FF",
                color: "#1D4ED8",
                border: "1px solid #BFDBFE",
                letterSpacing: "0.08em",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Instructions */}
      <p className="mt-4 text-xs text-gray-400">
        Drag across letters to spell words • 3+ letters to save
      </p>
    </div>
  );
}