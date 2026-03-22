import React from "react";
import Navbar from "../../components/dashboard/Navbar";
import GameCard from "../../components/dashboard/GameCard";
// import i1 from "../../assets/images/joindots.jpeg";
import i1 from "../../assets/images/joindots.jpeg";
import i2 from "../../assets/images/strand.jpeg"

const games = [
  {
    id: 1,
    title: "Join The Dots",
    description: "Play classic Connect The Dots with friends.",
    image: i1,
  },
  {
    id: 2,
    title: "Strands",
    description: "Brainstorm yourself with beautiful strings.",
    image: i2,
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Explore Games 
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;