import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/dashboard/Navbar";

import JoinTheDots from "../../games/join-the-dots/JoinTheDots";
import Strands from "../../games/strands/Strands";

const GamePage: React.FC = () => {
  const { id } = useParams();

  const renderGame = () => {
    switch (id) {
      case "1":
        return <JoinTheDots />;
      case "2":
        return <Strands />;
      default:
        return <div className="text-center mt-10">Game not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex justify-center items-center">
        {renderGame()}
      </div>
    </div>
  );
};

export default GamePage;