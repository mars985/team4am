import React from "react";

const players = [
  { rank: 1, name: "Akshat", score: 1200 },
  { rank: 2, name: "Anushka", score: 1100 },
  { rank: 3, name: "Sneha", score: 950 },
  { rank: 4, name: "Rahul", score: 900 },
  { rank: 5, name: "Priya", score: 850 },
];

const LeaderboardTable: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      
      <table className="w-full text-left">
        
        <thead className="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th className="px-6 py-3">Rank</th>
            <th className="px-6 py-3">Player</th>
            <th className="px-6 py-3">Score</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => (
            <tr
              key={player.rank}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 font-medium">
                {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : player.rank}
              </td>

              <td className="px-6 py-4">{player.name}</td>

              <td className="px-6 py-4 font-semibold text-primary">
                {player.score}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default LeaderboardTable;