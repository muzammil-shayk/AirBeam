import React from "react";
import namelogo from "../assets/namelogo.png";

const Navbar = ({ currentPage, onPageChange }) => {
  const baseButtonStyle = "px-4 py-2 cursor-pointer font-extrabold";
  const activeStyle = "text-white bg-teal-600 rounded-md";
  const inactiveStyle =
    "text-gray hover:bg-teal-600 hover:text-white rounded-md transition";

  return (
    <nav className="w-full h-24 bg-teal-500 z-50">
      {/* 🚨 This inner div now has h-full and uses flex and items-center to align its contents */}
      <div className="h-full flex justify-between items-center lg:px-4">
        <div className="airbeam-logo">
          <img
            src={namelogo}
            alt="AirBeam Logo"
            className="lg:h-64 h-44 w-auto lg:w-auto"
          />
        </div>
        <div className="lg:pr-8 lg:space-x-4">
          <button
            className={`${baseButtonStyle} ${
              currentPage === "upload" ? activeStyle : inactiveStyle
            }`}
            onClick={() => onPageChange("upload")}
          >
            Upload
          </button>
          <button
            className={`${baseButtonStyle} ${
              currentPage === "download" ? activeStyle : inactiveStyle
            }`}
            onClick={() => onPageChange("download")}
          >
            Download
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
