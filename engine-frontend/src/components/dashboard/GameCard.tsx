import React from "react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: number;
  title: string;
  description: string;
  image: string;
}

const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">

      <img
        src={game.image}
        alt={game.title}
        className="w-full h-40 object-contain bg-gray-100"
      />


      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {game.title}
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          {game.description}
        </p>

        <button
          onClick={() => navigate(`/game/${game.id}`)}
          className="mt-4 w-full bg-primary text-white py-2 rounded-md text-sm hover:opacity-90 transition"
        >
          Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard;