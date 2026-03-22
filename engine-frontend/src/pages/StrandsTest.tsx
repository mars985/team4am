import React from "react";
import Strands from "../games/strands/Strands";

const StrandsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Strands Game</h1>
          <p className="text-gray-600">Connect letters to form valid words</p>
        </div>
        
        <Strands />
      </div>
    </div>
  );
};

export default StrandsTest;
