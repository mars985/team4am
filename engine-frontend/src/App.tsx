import "./App.css";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/Dashboard/Home";
import Profile from "./pages/Dashboard/Profile";
import Leaderboard from "./pages/Dashboard/Leaderboard";
import GamePage from "./pages/game/GamePage";
import StrandsTest from "./pages/StrandsTest";
import DotsLobby from "./pages/DotsLobby";
import DotsTest from "./pages/DotsTest";
import StrandsLobby from "./pages/StrandsLobby";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import React from "react";

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/strands" element={<StrandsTest />} />
          <Route path="/strands/lobby" element={<StrandsLobby />} />
          <Route path="/strands/play" element={<StrandsTest />} />
          <Route path="/dots/lobby" element={<DotsLobby />} />
          <Route path="/dots/play" element={<DotsTest />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

const Root: React.FC = () => {
  // check if token exists in local storage
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
