import React from "react";
import JoinTheDots from "../games/join-the-dots/JoinTheDots";

const DotsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join The Dots</h1>
          <p className="text-gray-600">Multiplayer game - Connect dots to complete boxes</p>
        </div>
        
        <JoinTheDots />
      </div>
    </div>
  );
};

export default DotsTest;
