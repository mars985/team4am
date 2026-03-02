import { useState } from "react";

const DOT_SIZE = 16; // 16px
const GAP = 48; // 48px
const PADDING = 32; // 32px outer margin space

export default function JoinTheDots({ rows = 6, cols = 8 }) {
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [edges, setEdges] = useState<Set<string>>(new Set());

  const handleDotClick = (index: number) => {
    if (selectedDot === null) {
      setSelectedDot(index);
      return;
    }

    if (selectedDot === index) {
      setSelectedDot(null);
      return;
    }

    if (isAdjacent(selectedDot, index)) {
      const edgeKey = [selectedDot, index].sort((a, b) => a - b).join("-");
      setEdges((prev) => {
        if (prev.has(edgeKey)) return prev;
        const newSet = new Set(prev);
        newSet.add(edgeKey);
        return newSet;
      });
    }

    setSelectedDot(null);
  };

  const isAdjacent = (id1: number, id2: number) => {
    const r1 = Math.floor(id1 / cols);
    const c1 = id1 % cols;
    const r2 = Math.floor(id2 / cols);
    const c2 = id2 % cols;

    return (
      (r1 === r2 && Math.abs(c1 - c2) === 1) ||
      (c1 === c2 && Math.abs(r1 - r2) === 1)
    );
  };

  const getDotPosition = (index: number) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      x: col * (DOT_SIZE + GAP) + DOT_SIZE / 2,
      y: row * (DOT_SIZE + GAP) + DOT_SIZE / 2,
    };
  };

  const innerWidth = cols * DOT_SIZE + (cols - 1) * GAP;
  const innerHeight = rows * DOT_SIZE + (rows - 1) * GAP;

  const width = innerWidth + PADDING * 2;
  const height = innerHeight + PADDING * 2;

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4">
      <h2 className="mb-4 font-bold text-xl">
        Join the Dots ({rows}x{cols})
      </h2>

      <div
        className="relative bg-gray-50 rounded-xl shadow-inner"
        style={{ width, height }}
      >
        {/* Drawing Layer */}
        <div
          className="absolute"
          style={{
            top: PADDING,
            left: PADDING,
            width: innerWidth,
            height: innerHeight,
          }}
        >
          {/* SVG */}
          <svg
            width={innerWidth}
            height={innerHeight}
            className="absolute top-0 left-0 pointer-events-none"
          >
            {Array.from(edges).map((edge) => {
              const [a, b] = edge.split("-").map(Number);
              const p1 = getDotPosition(a);
              const p2 = getDotPosition(b);

              return (
                <line
                  key={edge}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="black"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${DOT_SIZE}px)`,
              gap: `${GAP}px`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, index) => (
              <div
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-4 h-4 rounded-full cursor-pointer transition-all
                  ${
                    selectedDot === index
                      ? "bg-red-500 scale-125"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
