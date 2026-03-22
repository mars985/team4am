import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";

type Node = {
  index: number;
  letter: string;
  x: number;
  y: number;
};

type GameState = {
  board: string[];
  baseWord: string;
  players: Record<string, { words: string[]; score: number }>;
  foundWords: string[];
};

const NODE_RADIUS = 26;
const SOCKET_URL = "http://localhost:5000";

export default function CircularStrands() {
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [size, setSize] = useState({ width: 340, height: 340 });
  const [isDragging, setIsDragging] = useState(false);
  const [path, setPath] = useState<Node[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [roomId] = useState("strands_room_1");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const visited = useRef<Set<number>>(new Set());

  // Socket.IO connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      socketRef.current?.emit("join-game", {
        roomId,
        type: "strands",
        playerId,
      });
    });

    socketRef.current.on("game-state", (state: GameState) => {
      console.log("Game state updated:", state);
      setGameState(state);
    });

    socketRef.current.on("word-validation", (result: any) => {
      if (result.success) {
        setMessage({ text: `+${result.points} points! ${result.word}`, type: "success" });
      } else {
        setMessage({ text: result.message, type: "error" });
      }
      setTimeout(() => setMessage(null), 2000);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [playerId, roomId]);

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
  const letters = gameState?.board || [];
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
    const selectedIndices = path.map((n) => n.index);

    if (word.length >= 3) {
      socketRef.current?.emit("player-move", {
        roomId,
        data: {
          playerId,
          word,
          selectedIndices,
        },
      });
    }
    
    setPath([]);
    visited.current.clear();
  };

  const handleResetBoard = () => {
    socketRef.current?.emit("reset-board", { roomId });
  };

  const currentWord = path.map((n) => n.letter).join("");
  const nodeSize = NODE_RADIUS * 2;
  const lineColor = "#3B82F6";

  const playerData = gameState?.players[playerId];
  const completedWords = playerData?.words || [];
  const score = playerData?.score || 0;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center flex-1 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to game...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 p-6 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Message notification */}
      {message && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

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
          <span className="text-xs text-gray-600 font-medium">words</span>
        </div>

        {/* Score display */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full text-white text-lg font-bold"
            style={{ width: 50, height: 50, background: "#10B981", border: "2px solid #059669" }}
          >
            {score}
          </div>
          <span className="text-xs text-gray-600 font-medium">score</span>
        </div>

        {/* Reset board */}
        <button
          onClick={handleResetBoard}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className="flex items-center justify-center rounded-full text-gray-400 text-sm transition-colors group-hover:text-gray-600"
            style={{ width: 40, height: 40, background: "#F3F4F6", border: "1.5px solid #E5E7EB" }}
          >
            ↺
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-600">new</span>
        </button>
      </div>

      {/* Live word display */}
      <div className="mb-4 h-8 flex items-center">
        {currentWord.length > 0 ? (
          <span
            className="text-2xl font-bold tracking-widest transition-all"
            style={{ color: "#1D4ED8", letterSpacing: "0.15em" }}
          >
            {currentWord}
          </span>
        ) : (
          <span className="text-sm font-medium text-gray-400">Drag to spell words</span>
        )}
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
        Drag across letters to spell words • 3+ letters minimum
      </p>
    </div>
  );
}
