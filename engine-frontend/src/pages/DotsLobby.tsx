import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DotsLobby: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [gridSize, setGridSize] = useState(5);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const navigate = useNavigate();

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    const newRoomCode = generateRoomCode();
    setGeneratedCode(newRoomCode);
    setShowCodeModal(true);
  };

  const handleStartGame = () => {
    navigate(
      `/dots/play?room=${generatedCode}&name=${encodeURIComponent(playerName)}&gridSize=${gridSize}&mode=multi`,
    );
  };

  const handleSinglePlayer = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    navigate(
      `/dots/play?name=${encodeURIComponent(playerName)}&gridSize=${gridSize}&mode=single`,
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setError("");
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    navigate(
      `/dots/play?room=${roomCode.toUpperCase()}&name=${encodeURIComponent(playerName)}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Join The Dots
          </h1>
          <p className="text-gray-600">Multiplayer Strategy Game</p>
        </div>

        {/* Room Code Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Room Created!
              </h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Share this code with your friend:
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 text-center">
                  <p className="text-4xl font-bold text-blue-600 tracking-widest">
                    {generatedCode}
                  </p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Game Settings:</p>
                <p className="text-sm font-semibold text-gray-800">
                  Grid Size: {gridSize}x{gridSize} ({gridSize * gridSize} boxes)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-300"
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Start Game →
                </button>
              </div>

              <button
                onClick={() => setShowCodeModal(false)}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Player Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              maxLength={20}
            />
          </div>

          {/* Grid Size Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grid Size
            </label>
            <div className="flex gap-2">
              {[3, 4, 5, 6, 7].map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                    gridSize === size
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {gridSize}x{gridSize} boxes = {gridSize * gridSize} total boxes
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4 shadow-md hover:shadow-lg"
          >
            🎮 Create New Room
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Join Room Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition uppercase"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            🚪 Join Room
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Create a room and share the code with a friend</li>
            <li>• Or join an existing room with a code</li>
            <li>• Take turns drawing lines between dots</li>
            <li>• Complete boxes to score points</li>
            <li>• Player with most boxes wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DotsLobby;
