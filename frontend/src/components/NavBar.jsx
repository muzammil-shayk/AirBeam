import React from "react";
import namelogo from "../assets/airbeamL.png";
import { Upload, Download } from "lucide-react"; // 🚨 NEW: Import Lucide icons

// The Navbar now accepts two props: currentPage and onPageChange
const Navbar = ({ currentPage, onPageChange }) => {
  // Common button styles
  const baseButtonStyle =
    "lg:px-4 px-3 py-2 cursor-pointer font-extrabold flex items-center gap-2 rounded-md transition-colors duration-300";

  return (
    // 🚨 UPDATED: The nav bar now has a fixed height of h-24 on desktop, and a slightly smaller height on mobile
    <nav className="w-full bg-teal-500 text-white h-20 md:h-24 z-50">
      {/* 🚨 UPDATED: The inner div has a fixed height of h-full to fill its parent. */}
      <div className="container mx-auto flex items-center justify-between px-2 md:px-4 h-full">
        <div className="airbeam-logo px-3 flex items-center">
          <img
            src={namelogo}
            alt="AirBeam Logo"
            // The logo's height is now h-16 on mobile and h-44 on desktop.
            className="h-20 md:h-44 w-auto" // 🚨 UPDATED: The logo is now large and will overflow the navbar.
          />
        </div>
        <div className="flex items-center md:space-x-4">
          <button
            // 🚨 UPDATED: The button's active background is now responsive. It's transparent on mobile and dark teal on desktop.
            className={`${baseButtonStyle} ${
              currentPage === "upload"
                ? "bg-transparent md:bg-teal-600"
                : "bg-transparent md:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("upload")}
          >
            {/* 🚨 NEW: The icon color is now conditional. It will be gray when active on mobile. */}
            <Upload
              className={`md:hidden ${
                currentPage === "upload" ? "text-gray" : "text-white"
              }`}
              size={20}
            />
            {/* 🚨 The text remains the same, visible only on desktop with a white color. */}
            <span className="hidden md:inline">Upload</span>
          </button>
          <button
            // 🚨 UPDATED: The button's active background is now responsive. It's transparent on mobile and dark teal on desktop.
            className={`${baseButtonStyle} ${
              currentPage === "download"
                ? "bg-transparent md:bg-teal-600"
                : "bg-transparent md:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("download")}
          >
            {/* 🚨 NEW: The icon color is now conditional. It will be gray when active on mobile. */}
            <Download
              className={`md:hidden ${
                currentPage === "download" ? "text-gray" : "text-white"
              }`}
              size={20}
            />
            {/* 🚨 The text remains the same, visible only on desktop with a white color. */}
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
