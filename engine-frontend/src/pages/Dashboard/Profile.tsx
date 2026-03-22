import React from "react";
import Navbar from "../../components/dashboard/Navbar";

//backend se actual data jo aayega, wohi daalna h idhr
const Profile: React.FC = () => {
  const user = {
    name: "dummy dummy :) ",
    email: "heyybaby@example.com",
    joined: "March 2026",
    avatar: "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white shadow-sm rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <p className="text-xs text-gray-400 mt-2">
                Joined {user.joined}
              </p>
            </div>
          </div>
          <div className="border-t my-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-800">12</p>
              <p className="text-sm text-gray-500">Games Played</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-800">5</p>
              <p className="text-sm text-gray-500">Wins</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-800">3</p>
              <p className="text-sm text-gray-500">Achievements</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center md:justify-end">
            <button className="bg-primary text-white px-5 py-2 rounded-md text-sm hover:opacity-90 transition">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;