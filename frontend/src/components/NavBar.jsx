import React from "react";
import namelogo from "../assets/airbeamL.png";
import { Upload, Download } from "lucide-react"; // 🚨 NEW: Import Lucide icons

const Navbar = ({ currentPage, onPageChange }) => {
  const baseButtonStyle =
    "lg:px-4 px-3 py-2 cursor-pointer font-extrabold flex items-center gap-2 rounded-md transition-colors duration-300";

  return (
    <nav className="w-full bg-teal-500 text-white h-20 md:h-24 z-50">
      <div className="container mx-auto flex items-center justify-between px-2 md:px-4 h-full">
        <div className="airbeam-logo px-3 flex items-center">
          <img
            src={namelogo}
            alt="AirBeam Logo"
            className="h-20 md:h-44 w-auto"
          />
        </div>
        <div className="flex items-center md:space-x-4">
          <button
            className={`${baseButtonStyle} ${
              currentPage === "upload"
                ? "bg-transparent md:bg-teal-600"
                : "bg-transparent md:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("upload")}
          >
            <Upload
              className={`md:hidden ${
                currentPage === "upload" ? "text-gray" : "text-white"
              }`}
              size={20}
            />
            <span className="hidden md:inline">Upload</span>
          </button>
          <button
            className={`${baseButtonStyle} ${
              currentPage === "download"
                ? "bg-transparent md:bg-teal-600"
                : "bg-transparent md:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("download")}
          >
            <Download
              className={`md:hidden ${
                currentPage === "download" ? "text-gray" : "text-white"
              }`}
              size={20}
            />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
