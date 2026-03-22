import React from "react";
import Navbar from "../../components/dashboard/Navbar";
import LeaderboardTable from "../../components/dashboard/LeaderboardTable";

const Leaderboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Leaderboard 
        </h2>

        <LeaderboardTable />
      </div>
    </div>
  );
};

export default Leaderboard;