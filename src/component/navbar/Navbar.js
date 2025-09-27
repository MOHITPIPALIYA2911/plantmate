// src/component/Navbar.jsx
// Green (emerald) navbar, safe user handling, dropdown, optional sidebar toggle, dummy notif badge

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaCog,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultProfile from "../../assests/noprofile.jpeg";
import logo from "../../assests/logo.jpeg";

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);

  // safely parse user
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user")) || null;
  } catch (_) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // close dropdown on outside click / route change / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-emerald-600 shadow-md z-50 flex items-center justify-between px-4 md:px-6">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar?.()}
          className="p-2 rounded-lg text-white/90 hover:bg-emerald-500 md:hidden"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
          title="PlantMate"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 rounded object-cover border-2 border-emerald-400"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="hidden sm:block text-white font-semibold text-lg tracking-wide">
            PlantMate
          </span>
        </button>
      </div>

      {/* Center: search (hidden on small) */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plants, spaces, or tasks…"
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-500/40 placeholder-white/80 text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          className="relative p-2 rounded-xl text-white/90 hover:bg-emerald-500"
          title="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <FaBell />
          <span className="absolute -top-1 -right-1 h-5 min-w-[1.1rem] rounded-full bg-white text-emerald-700 text-xs px-1 flex items-center justify-center">
            2
          </span>
        </button>

        <button
          onClick={() => setOpen((s) => !s)}
          className="flex items-center gap-2"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <img
            src={user?.photo || defaultProfile}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-300"
          />
          <div className="hidden sm:flex flex-col items-start leading-tight text-white">
            <span className="text-sm font-semibold">
              {(user?.first_Name || user?.firstName || "Guest") +
                " " +
                (user?.LastName || user?.lastName || "")}
            </span>
            <span className="text-[11px] opacity-90 capitalize">
              {user?.role || "user"}
            </span>
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="menu"
            className="absolute right-4 top-14 w-64 bg-white rounded-lg shadow-xl p-3"
          >
            <div className="px-2 py-1.5">
              <div className="font-semibold text-gray-800">
                {(user?.first_Name || user?.firstName || "Guest") +
                  " " +
                  (user?.LastName || user?.lastName || "")}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {user?.emailId || user?.email || "-"}
              </div>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FaCog className="text-emerald-600" /> Settings
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FaUser className="text-emerald-600" /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
