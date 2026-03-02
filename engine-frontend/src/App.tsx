import { useState } from "react";
import "./App.css";
import JoinTheDots from "./games/join-the-dots/JoinTheDots";
import Strands from "./games/strands/Strands";

export default function App() {
  const [game, setGame] = useState("none");

  const renderGame = () => {
    switch (game) {
      case "join-the-dots":
        return <JoinTheDots rows={8} cols={12}></JoinTheDots>;
      case "strands":
        return <Strands></Strands>;
      default:
        return <div className="p-4">Please select a game</div>;
    }
  };

  return (
    <div className="bg-blue-300 w-screen h-screen flex flex-col">
      <div className="p-4 flex gap-4 border-b border-blue-400">
        <button
          className="btn px-4 py-2"
          onClick={() => setGame("join-the-dots")}
        >
          join the dots!
        </button>
        <button
          className="btn px-4 py-2"
          onClick={() => setGame("strands")}
        >
          strands!
        </button>
      </div>

      <div className="flex-1 relative">{renderGame()}</div>
    </div>
  );
}
