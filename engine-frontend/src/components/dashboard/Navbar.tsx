import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <h1
          className="text-lg font-semibold text-primary cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Team 4AM
        </h1>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-black transition"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="hover:text-black transition"
          >
            Leaderboard
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button
            className="text-sm text-gray-600 hover:text-black transition"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>

          <button
            className="text-sm bg-primary text-white px-4 py-1.5 rounded-md hover:opacity-90 transition"
            onClick={() => navigate("/login")}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Navbar: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="w-full bg-white shadow-sm border-b">
//       <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
//         <h1 className="text-lg font-semibold text-primary cursor-pointer">
//           Team 4AM
//         </h1>

//         <div className="flex items-center gap-4">
//           <button
//             className="text-sm text-gray-600 hover:text-black transition"
//             onClick={() => navigate("/profile")}
//           >
//             Profile
//           </button>

//           <button
//             className="text-sm bg-primary text-white px-4 py-1.5 rounded-md hover:opacity-90 transition"
//             onClick={() => navigate("/login")}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;