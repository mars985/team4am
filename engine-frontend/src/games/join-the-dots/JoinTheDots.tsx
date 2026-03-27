import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";

const DOT_SIZE = 18;
const GAP = 52;
const PADDING = 36;

type GameState = {
  edges: Array<{ key: string; player: number }>;
  boxes: Record<string, number>;
  scores: { 1: number; 2: number };
  currentPlayer: number;
  players: Record<string, { playerNumber: number; color: string; name: string }>;
  gridSize: number;
  gameOver: boolean;
  winner: number | "tie" | null;
};

const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function JoinTheDots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [searchParams] = useSearchParams();
  
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const [roomId] = useState(() => searchParams.get("room") || `dots_${Math.random().toString(36).substr(2, 9)}`);
  const [requestedGridSize] = useState(() => parseInt(searchParams.get("gridSize") || "5"));
  const [playerName] = useState(() => searchParams.get("name") || "Guest");
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  const selectedEdgeRef = useRef<string | null>(null);

  useEffect(() => {
    selectedEdgeRef.current = selectedEdge;
  }, [selectedEdge]);

  // Socket.IO connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      socketRef.current?.emit("join-game", {
        roomId,
        type: "dots",
        playerId,
        gridSize: requestedGridSize,
        playerName,
      });
    });

    socketRef.current.on("player-assigned", ({ playerNumber, color }) => {
      console.log(`Assigned as Player ${playerNumber} (${color})`);
      setMyPlayerNumber(playerNumber);
      setMessage({ text: `You are Player ${playerNumber} (${color})`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    });

    socketRef.current.on("game-state", (state: GameState) => {
      console.log("Game state updated:", state);
      setGameState(state);
    });

    socketRef.current.on("move-error", (error: { message: string }) => {
      setMessage({ text: error.message, type: "error" });
      setTimeout(() => setMessage(null), 2000);
    });

    // Listen for player leaving
    socketRef.current.on("player-left", ({ playerName, message }) => {
      setMessage({ text: message, type: "error" });
      setOpponentLeft(true);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [playerId, roomId, requestedGridSize, playerName]);

  // Auto-redirect loser to dashboard immediately when game ends
  useEffect(() => {
    if (gameState?.gameOver && myPlayerNumber !== null) {
      const isWinner = gameState.winner === myPlayerNumber || opponentLeft;
      const isTie = gameState.winner === "tie";
      
      // If player lost (not winner and not tie), redirect to dashboard immediately
      if (!isWinner && !isTie) {
        socketRef.current?.disconnect();
        window.location.href = "/dashboard";
      }
    }
  }, [gameState?.gameOver, gameState?.winner, myPlayerNumber, opponentLeft]);

  const isAdjacent = (id1: number, id2: number) => {
    const r1 = Math.floor(id1 / dotsPerSide), c1 = id1 % dotsPerSide;
    const r2 = Math.floor(id2 / dotsPerSide), c2 = id2 % dotsPerSide;
    return (
      (r1 === r2 && Math.abs(c1 - c2) === 1) ||
      (c1 === c2 && Math.abs(r1 - r2) === 1)
    );
  };

  const getDotPosition = (index: number) => {
    const row = Math.floor(index / dotsPerSide), col = index % dotsPerSide;
    return {
      x: col * (DOT_SIZE + GAP) + DOT_SIZE / 2,
      y: row * (DOT_SIZE + GAP) + DOT_SIZE / 2,
    };
  };

  const createEdgeKey = (dot1: number, dot2: number) => {
    const r1 = Math.floor(dot1 / dotsPerSide), c1 = dot1 % dotsPerSide;
    const r2 = Math.floor(dot2 / dotsPerSide), c2 = dot2 % dotsPerSide;
    
    if (r1 === r2) {
      // Horizontal edge
      const minCol = Math.min(c1, c2);
      return `${r1},${minCol}-h`;
    } else {
      // Vertical edge
      const minRow = Math.min(r1, r2);
      return `${minRow},${c1}-v`;
    }
  };

  const handleMouseDown = (index: number) => {
    if (!gameState || gameState.gameOver) return;
    if (myPlayerNumber !== gameState.currentPlayer) return;
    
    setIsDragging(true);
    setSelectedDot(index);
    setSelectedEdge(null);
  };

  const handleMouseEnter = (index: number) => {
    if (!isDragging || selectedDot === null || selectedDot === index) return;
    if (isAdjacent(selectedDot, index)) {
      const edgeKey = createEdgeKey(selectedDot, index);
      setSelectedEdge(edgeKey);
    } else {
      setSelectedEdge(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const edge = selectedEdgeRef.current;
    if (edge && gameState) {
      // Check if edge already exists
      const edgeExists = gameState.edges.some(e => e.key === edge);
      
      if (!edgeExists) {
        socketRef.current?.emit("player-move", {
          roomId,
          data: {
            playerId,
            edge: { key: edge }
          },
        });
      }
    }

    setIsDragging(false);
    setSelectedDot(null);
    setSelectedEdge(null);
  };

  const handleResetGame = () => {
    socketRef.current?.emit("reset-board", { roomId });
  };

  const handleBackToDashboard = () => {
    socketRef.current?.disconnect();
    window.location.href = "/dashboard";
  };

  const handleLeaveGame = () => {
    if (window.confirm("Are you sure you want to leave the game?")) {
      socketRef.current?.emit("leave-game", { roomId, playerId, playerName });
      setTimeout(() => {
        window.location.href = "/dots/lobby";
      }, 500);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  });

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

  const gridSize = gameState.gridSize;
  const dotsPerSide = gridSize + 1; // For 4x4 boxes, we need 5x5 dots
  const totalBoxes = gridSize * gridSize;
  const player1Score = gameState.scores[1] || 0;
  const player2Score = gameState.scores[2] || 0;

  // Get player names
  const player1Data = Object.values(gameState.players).find(p => p.playerNumber === 1);
  const player2Data = Object.values(gameState.players).find(p => p.playerNumber === 2);
  const player1Name = player1Data?.name || "Player 1";
  const player2Name = player2Data?.name || "Player 2";

  const innerWidth = dotsPerSide * DOT_SIZE + (dotsPerSide - 1) * GAP;
  const innerHeight = dotsPerSide * DOT_SIZE + (dotsPerSide - 1) * GAP;
  const width = innerWidth + PADDING * 2;
  const height = innerHeight + PADDING * 2;

  const getPlayerColor = (playerNum: number) => playerNum === 1 ? "blue" : "red";
  const isMyTurn = myPlayerNumber === gameState.currentPlayer;

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 p-6 select-none"
      onMouseUp={handleMouseUp}
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

      {/* Victory Modal */}
      {gameState?.gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              {opponentLeft ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">You Win!</h2>
                  <p className="text-gray-600">Opponent left the game</p>
                </>
              ) : gameState.winner === myPlayerNumber ? (
                <>
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Victory!</h2>
                  <p className="text-gray-600">You won the game!</p>
                </>
              ) : gameState.winner === "tie" ? (
                <>
                  <div className="text-6xl mb-4">🤝</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">It's a Tie!</h2>
                  <p className="text-gray-600">Great game!</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😔</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over</h2>
                  <p className="text-gray-600">Better luck next time!</p>
                </>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center">FINAL SCORES</h3>
              <div className="space-y-2">
                <div className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                  gameState.winner === 1 ? "bg-blue-50 border-2 border-blue-300" : "bg-white"
                }`}>
                  <span className="font-semibold text-gray-800">
                    🔵 {player1Name} {myPlayerNumber === 1 && "(You)"}
                  </span>
                  <span className="text-lg font-bold text-blue-600">{player1Score}</span>
                </div>
                <div className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                  gameState.winner === 2 ? "bg-red-50 border-2 border-red-300" : "bg-white"
                }`}>
                  <span className="font-semibold text-gray-800">
                    🔴 {player2Name} {myPlayerNumber === 2 && "(You)"}
                  </span>
                  <span className="text-lg font-bold text-red-600">{player2Score}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetGame}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-xl mb-5">
        {/* Player 1 (Blue) score */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex items-center justify-center rounded-full text-white text-sm font-bold ${
              myPlayerNumber === 1 ? "ring-2 ring-offset-2 ring-blue-400" : ""
            }`}
            style={{
              width: 40,
              height: 40,
              background: "#3B82F6",
              border: "2px solid #2563EB",
            }}
          >
            {player1Score}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {player1Name} {myPlayerNumber === 1 && "(You)"}
          </span>
        </div>

        {/* Center status */}
        <div className="text-center">
          {gameState.gameOver ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-base font-semibold text-gray-700">
                {opponentLeft 
                  ? "🎉 You Win!"
                  : gameState.winner === 1
                    ? `🔵 ${player1Name} wins!`
                    : gameState.winner === 2
                      ? `🔴 ${player2Name} wins!`
                      : "It's a tie!"}
              </p>
              {opponentLeft && (
                <p className="text-sm text-gray-500">Opponent left the game</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleResetGame}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
                >
                  Play again
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors border border-blue-200"
                >
                  Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: gameState.currentPlayer === 1 ? "#3B82F6" : "#EF4444",
                    boxShadow: `0 0 0 3px ${gameState.currentPlayer === 1 ? "#BFDBFE" : "#FEE2E2"}`,
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  Player {gameState.currentPlayer}'s turn
                  {isMyTurn && " (Your turn!)"}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {totalBoxes - player1Score - player2Score} boxes left
              </span>
            </div>
          )}
        </div>

        {/* Player 2 (Red) score */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex items-center justify-center rounded-full text-white text-sm font-bold ${
              myPlayerNumber === 2 ? "ring-2 ring-offset-2 ring-red-400" : ""
            }`}
            style={{
              width: 40,
              height: 40,
              background: "#EF4444",
              border: "2px solid #DC2626",
            }}
          >
            {player2Score}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {player2Name} {myPlayerNumber === 2 && "(You)"}
          </span>
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
          {Object.entries(gameState.boxes).map(([key, player]) => {
            const [r, c] = key.split(",").map(Number);
            return (
              <div
                key={key}
                className="absolute rounded-md"
                style={{
                  left: c * (DOT_SIZE + GAP) + DOT_SIZE,
                  top: r * (DOT_SIZE + GAP) + DOT_SIZE,
                  width: GAP,
                  height: GAP,
                  background: player === 1 ? "#3B82F6" : "#EF4444",
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
            {gameState.edges.map((edge, idx) => {
              const [pos, dir] = edge.key.split("-");
              const [r, c] = pos.split(",").map(Number);
              
              let x1, y1, x2, y2;
              if (dir === "h") {
                x1 = c * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y1 = r * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                x2 = (c + 1) * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y2 = y1;
              } else {
                x1 = c * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y1 = r * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                x2 = x1;
                y2 = (r + 1) * (DOT_SIZE + GAP) + DOT_SIZE / 2;
              }

              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.player === 1 ? "#1D4ED8" : "#DC2626"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}

            {selectedEdge && (() => {
              const [pos, dir] = selectedEdge.split("-");
              const [r, c] = pos.split(",").map(Number);
              
              let x1, y1, x2, y2;
              if (dir === "h") {
                x1 = c * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y1 = r * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                x2 = (c + 1) * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y2 = y1;
              } else {
                x1 = c * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                y1 = r * (DOT_SIZE + GAP) + DOT_SIZE / 2;
                x2 = x1;
                y2 = (r + 1) * (DOT_SIZE + GAP) + DOT_SIZE / 2;
              }

              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={gameState.currentPlayer === 1 ? "#3B82F6" : "#EF4444"}
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
              gridTemplateColumns: `repeat(${dotsPerSide}, ${DOT_SIZE}px)`,
              gap: `${GAP}px`,
            }}
          >
            {Array.from({ length: dotsPerSide * dotsPerSide }).map((_, index) => (
              <div
                key={index}
                onMouseDown={() => handleMouseDown(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                className={`transition-all duration-100 ${
                  isMyTurn && !gameState.gameOver ? "cursor-pointer" : "cursor-not-allowed"
                }`}
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

      {/* Instructions */}
      <div className="flex items-center gap-4 mt-4">
        <p className="text-xs text-gray-400 flex-1 text-center">
          {isMyTurn 
            ? "Your turn! Drag between dots to draw lines • Complete a box to score"
            : "Waiting for other player..."}
        </p>
        {!gameState?.gameOver && (
          <button
            onClick={handleLeaveGame}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Leave Game
          </button>
        )}
      </div>
    </div>
  );
}
