import { useState, useEffect, useRef } from "react";

const DOT_SIZE = 18;
const GAP = 52;
const PADDING = 36;

export default function JoinTheDots({ rows = 6, cols = 8 }) {
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [edges, setEdges] = useState<Map<string, "blue" | "red">>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [boxes, setBoxes] = useState<Map<string, "blue" | "red">>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<"blue" | "red">("blue");

  // Refs so the window mouseup listener always sees current values.
  // Synced inside useEffect (not during render) to avoid the React warning.
  const selectedEdgeRef = useRef<string | null>(null);
  const edgesRef = useRef<Map<string, "blue" | "red">>(new Map());
  const boxesRef = useRef<Map<string, "blue" | "red">>(new Map());
  const currentPlayerRef = useRef<"blue" | "red">("blue");

  useEffect(() => {
    selectedEdgeRef.current = selectedEdge;
  }, [selectedEdge]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);
  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const hasEdge = (
    a: number,
    b: number,
    edgeSet: Map<string, "blue" | "red">,
  ) => {
    const key = [a, b].sort((x, y) => x - y).join("-");
    return edgeSet.has(key);
  };

  const isAdjacent = (id1: number, id2: number) => {
    const r1 = Math.floor(id1 / cols),
      c1 = id1 % cols;
    const r2 = Math.floor(id2 / cols),
      c2 = id2 % cols;
    return (
      (r1 === r2 && Math.abs(c1 - c2) === 1) ||
      (c1 === c2 && Math.abs(r1 - r2) === 1)
    );
  };

  const getDotPosition = (index: number) => {
    const row = Math.floor(index / cols),
      col = index % cols;
    return {
      x: col * (DOT_SIZE + GAP) + DOT_SIZE / 2,
      y: row * (DOT_SIZE + GAP) + DOT_SIZE / 2,
    };
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    setSelectedDot(index);
    setSelectedEdge(null);
  };

  const handleMouseEnter = (index: number) => {
    if (!isDragging || selectedDot === null || selectedDot === index) return;
    if (isAdjacent(selectedDot, index)) {
      const edgeKey = [selectedDot, index].sort((a, b) => a - b).join("-");
      setSelectedEdge(edgeKey);
    } else {
      setSelectedEdge(null);
    }
  };

  const handleMouseUp = () => {
    const edge = selectedEdgeRef.current;
    if (edge && !edgesRef.current.has(edge)) {
      const player = currentPlayerRef.current;
      const newEdges = new Map(edgesRef.current);
      newEdges.set(edge, player);

      const newBoxes = new Map(boxesRef.current);
      let scored = false;

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const topLeft = r * cols + c;
          const topRight = topLeft + 1;
          const bottomLeft = topLeft + cols;
          const bottomRight = bottomLeft + 1;
          const key = `${r}-${c}`;
          if (newBoxes.has(key)) continue;
          if (
            hasEdge(topLeft, topRight, newEdges) &&
            hasEdge(bottomLeft, bottomRight, newEdges) &&
            hasEdge(topLeft, bottomLeft, newEdges) &&
            hasEdge(topRight, bottomRight, newEdges)
          ) {
            newBoxes.set(key, player);
            scored = true;
          }
        }
      }

      setEdges(newEdges);
      setBoxes(newBoxes);
      if (!scored) {
        setCurrentPlayer(player === "blue" ? "red" : "blue");
      }
    }

    setIsDragging(false);
    setSelectedDot(null);
    setSelectedEdge(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  });

  const totalBoxes = (rows - 1) * (cols - 1);
  const blueBoxes = [...boxes.values()].filter((v) => v === "blue").length;
  const redBoxes = [...boxes.values()].filter((v) => v === "red").length;
  const gameOver = blueBoxes + redBoxes === totalBoxes;

  const innerWidth = cols * DOT_SIZE + (cols - 1) * GAP;
  const innerHeight = rows * DOT_SIZE + (rows - 1) * GAP;
  const width = innerWidth + PADDING * 2;
  const height = innerHeight + PADDING * 2;

  const resetGame = () => {
    setEdges(new Map());
    setBoxes(new Map());
    setCurrentPlayer("blue");
    setSelectedDot(null);
    setSelectedEdge(null);
    setIsDragging(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 p-6 select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-xl mb-5">
        {/* Blue score */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full text-white text-sm font-bold"
            style={{
              width: 40,
              height: 40,
              background: "#3B82F6",
              border: "2px solid #2563EB",
            }}
          >
            {blueBoxes}
          </div>
          <span className="text-xs text-gray-500 font-medium">Blue</span>
        </div>

        {/* Center status */}
        <div className="text-center">
          {gameOver ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-base font-semibold text-gray-700">
                {blueBoxes > redBoxes
                  ? "🔵 Blue wins!"
                  : redBoxes > blueBoxes
                    ? "🔴 Red wins!"
                    : "It's a tie!"}
              </p>
              <button
                onClick={resetGame}
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
              >
                Play again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background:
                      currentPlayer === "blue" ? "#3B82F6" : "#EF4444",
                    boxShadow: `0 0 0 3px ${currentPlayer === "blue" ? "#BFDBFE" : "#FEE2E2"}`,
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {currentPlayer === "blue" ? "Blue" : "Red"}'s turn
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {totalBoxes - blueBoxes - redBoxes} boxes left
              </span>
            </div>
          )}
        </div>

        {/* Red score */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full text-white text-sm font-bold"
            style={{
              width: 40,
              height: 40,
              background: "#EF4444",
              border: "2px solid #DC2626",
            }}
          >
            {redBoxes}
          </div>
          <span className="text-xs text-gray-500 font-medium">Red</span>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-2xl"
        style={{
          width,
          height,
          background: "#F8F9FA",
          border: "1.5px solid #E5E7EB",
        }}
      >
        <div
          className="absolute"
          style={{
            top: PADDING,
            left: PADDING,
            width: innerWidth,
            height: innerHeight,
          }}
        >
          {/* Filled boxes */}
          {Array.from(boxes.entries()).map(([key, player]) => {
            const [r, c] = key.split("-").map(Number);
            return (
              <div
                key={key}
                className="absolute rounded-md"
                style={{
                  left: c * (DOT_SIZE + GAP) + DOT_SIZE,
                  top: r * (DOT_SIZE + GAP) + DOT_SIZE,
                  width: GAP,
                  height: GAP,
                  background: player === "blue" ? "#3B82F6" : "#EF4444",
                  opacity: 0.18,
                }}
              />
            );
          })}

          {/* SVG lines */}
          <svg
            width={innerWidth}
            height={innerHeight}
            className="absolute top-0 left-0 pointer-events-none"
          >
            {Array.from(edges.entries()).map(([edge, player]) => {
              const [a, b] = edge.split("-").map(Number);
              const p1 = getDotPosition(a),
                p2 = getDotPosition(b);
              return (
                <line
                  key={edge}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={player === "blue" ? "#1D4ED8" : "#DC2626"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}

            {selectedEdge &&
              (() => {
                const [a, b] = selectedEdge.split("-").map(Number);
                const p1 = getDotPosition(a),
                  p2 = getDotPosition(b);
                return (
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={currentPlayer === "blue" ? "#3B82F6" : "#EF4444"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    opacity={0.6}
                  />
                );
              })()}
          </svg>

          {/* Dots grid */}
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
                onMouseDown={() => handleMouseDown(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                className="cursor-pointer transition-all duration-100"
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: "50%",
                  background: selectedDot === index ? "#1D4ED8" : "#CBD5E1",
                  transform: selectedDot === index ? "scale(1.35)" : "scale(1)",
                  border:
                    selectedDot === index
                      ? "2px solid #93C5FD"
                      : "2px solid transparent",
                  boxShadow:
                    selectedDot === index ? "0 0 0 3px #BFDBFE" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subtle instructions */}
      <p className="mt-4 text-xs text-gray-400">
        Drag between dots to draw lines • Complete a box to score
      </p>
    </div>
  );
}
