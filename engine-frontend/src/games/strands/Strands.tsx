import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";

type Node = {
  index: number;
  letter: string;
  x: number;
  y: number;
};

type GameState = {
  board: string[];
  baseWord: string;
  players: Record<string, { name: string; words: string[]; score: number }>;
  foundWords: string[];
};

const NODE_RADIUS = 26;
const SOCKET_URL = import.meta.env.VITE_BASE_URL;

export default function CircularStrands() {
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [searchParams] = useSearchParams();
  const [size, setSize] = useState({ width: 340, height: 340 });
  const [isDragging, setIsDragging] = useState(false);
  const [path, setPath] = useState<Node[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [roomId] = useState(() => searchParams.get("room") || `single_${Math.random().toString(36).substr(2, 9)}`);
  const [playerName] = useState(() => searchParams.get("name") || "Guest");
  const [gameMode] = useState(() => searchParams.get("mode") || "single");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
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
        playerName,
      });
    });

    socketRef.current.on("game-state", (state: GameState) => {
      console.log("Game state updated:", state);
      setGameState(state);
      
      // Start timer in multiplayer mode
      if (gameMode === "multi" && state && timeLeft === null) {
        setTimeLeft(180); // 3 minutes
      }
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
  }, [playerId, roomId, playerName, gameMode]);

  // Timer countdown for multiplayer
  useEffect(() => {
    if (gameMode === "multi" && timeLeft !== null && timeLeft > 0 && !gameEnded) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setGameEnded(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameMode, gameEnded]);

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
    if (gameEnded) return;
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
    if (!isDragging || gameEnded) return;
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

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get winner in multiplayer
  const getWinner = () => {
    if (!gameState || gameMode !== "multi") return null;
    const players = Object.entries(gameState.players);
    if (players.length === 0) return null;
    
    const sorted = players.sort(([, a], [, b]) => b.score - a.score);
    const [winnerId, winnerData] = sorted[0];
    
    if (sorted.length > 1 && sorted[0][1].score === sorted[1][1].score) {
      return { name: "Tie", isTie: true };
    }
    
    return { name: winnerData.name, isTie: false, isYou: winnerId === playerId };
  };

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

      {/* Game Over Modal */}
      {gameMode === "multi" && gameEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Time's Up!</h2>
            
            {(() => {
              const winner = getWinner();
              return winner ? (
                <div className="mb-6 text-center">
                  {winner.isTie ? (
                    <p className="text-xl font-semibold text-gray-700">It's a tie! 🤝</p>
                  ) : (
                    <p className="text-xl font-semibold text-gray-700">
                      🏆 {winner.name} wins! {winner.isYou && "🎉"}
                    </p>
                  )}
                </div>
              ) : null;
            })()}

            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center">FINAL SCORES</h3>
              <div className="space-y-2">
                {gameState && Object.entries(gameState.players)
                  .sort(([, a], [, b]) => b.score - a.score)
                  .map(([pid, player], index) => (
                    <div
                      key={pid}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                        index === 0 ? "bg-yellow-50 border-2 border-yellow-300" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-xl">🏆</span>}
                        <span className="font-semibold text-gray-800">
                          {player.name} {pid === playerId && "(You)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{player.words.length} words</span>
                        <span className="text-lg font-bold text-purple-600">{player.score}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => window.location.href = "/strands/lobby"}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}

      {/* Header status bar */}
      <div className="w-full max-w-sm mb-5">
        {/* Multiplayer Scores */}
        {gameMode === "multi" && Object.keys(gameState.players).length > 1 && (
          <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 text-center">PLAYERS</h3>
            <div className="space-y-2">
              {Object.entries(gameState.players)
                .sort(([, a], [, b]) => b.score - a.score)
                .map(([pid, player]) => (
                  <div key={pid} className="space-y-1">
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        pid === playerId ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {player.name} {pid === playerId && "(You)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{player.words.length} words</span>
                        <span className="text-sm font-bold text-purple-600">{player.score}</span>
                      </div>
                    </div>
                    {/* Show player's words */}
                    {player.words.length > 0 && (
                      <div className="px-3 flex flex-wrap gap-1">
                        {player.words.map((word, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{
                              background: pid === playerId ? "#EDE9FE" : "#F3F4F6",
                              color: pid === playerId ? "#7C3AED" : "#6B7280",
                            }}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
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

          {/* Score display or Timer */}
          <div className="flex flex-col items-center gap-1">
            {gameMode === "multi" && timeLeft !== null ? (
              <>
                <div
                  className={`flex items-center justify-center rounded-full text-white text-lg font-bold ${
                    timeLeft <= 30 ? "animate-pulse" : ""
                  }`}
                  style={{
                    width: 60,
                    height: 60,
                    background: timeLeft <= 30 ? "#EF4444" : "#F59E0B",
                    border: `2px solid ${timeLeft <= 30 ? "#DC2626" : "#D97706"}`,
                  }}
                >
                  {formatTime(timeLeft)}
                </div>
                <span className="text-xs text-gray-600 font-medium">time left</span>
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center rounded-full text-white text-lg font-bold"
                  style={{ width: 50, height: 50, background: "#10B981", border: "2px solid #059669" }}
                >
                  {score}
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {gameMode === "multi" ? "your score" : "score"}
                </span>
              </>
            )}
          </div>

          {/* Reset board - Only in single player */}
          {gameMode === "single" && (
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
          )}
          
          {/* Score in multiplayer (when timer is showing) */}
          {gameMode === "multi" && timeLeft !== null && (
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ width: 40, height: 40, background: "#10B981", border: "2px solid #059669" }}
              >
                {score}
              </div>
              <span className="text-xs text-gray-600 font-medium">score</span>
            </div>
          )}
        </div>
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

      {/* Found words - Only show in single player mode */}
      {gameMode === "single" && completedWords.length > 0 && (
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
