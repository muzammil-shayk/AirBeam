import React from "react";
import { Upload, Download } from "lucide-react";
import airbeamlogo from "../assets/airbeamlogo.svg";
import mobilelogo from "../assets/logo.svg";
const Navbar = ({ currentPage, onPageChange }) => {
  const baseButtonStyle =
    "lg:px-4 px-3 py-2 cursor-pointer font-extrabold flex items-center gap-2 rounded-md transition-colors duration-300";

  return (
    <nav className="w-full bg-teal-500 text-white h-20 lg:h-24 z-50">
      <div className="flex items-center justify-between lg:px-24 px-3 h-full">
        <div className="airbeam-logo px-3 flex items-center">
          {/* 🚨 UPDATED: This image is visible on desktop (md and up) and hidden on mobile */}
          <img
            src={airbeamlogo}
            alt="AirBeam Logo"
            className="lg:h-96 lg:-m-20 h-20 hidden lg:block"
          />
          {/* 🚨 UPDATED: This image is visible on mobile and hidden on desktop (md and up) */}
          <img
            src={mobilelogo}
            alt="AirBeam Logo"
            className="h-48 -ml-12 lg:hidden"
          />
        </div>
        <div className="flex items-center lg:space-x-4 lg:-mr-10">
          <button
            className={`${baseButtonStyle} ${
              currentPage === "upload"
                ? "bg-transparent lg:bg-teal-600"
                : "bg-transparent lg:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("upload")}
          >
            <Upload
              className={`lg:hidden ${
                currentPage === "upload" ? "text-gray" : "text-white"
              }`}
              size={28}
            />
            <span className="hidden lg:inline">Upload</span>
          </button>
          <button
            className={`${baseButtonStyle} ${
              currentPage === "download"
                ? "bg-transparent lg:bg-teal-600"
                : "bg-transparent lg:hover:bg-teal-600"
            }`}
            onClick={() => onPageChange("download")}
          >
            <Download
              className={`lg:hidden ${
                currentPage === "download" ? "text-gray" : "text-white"
              }`}
              size={28}
            />
            <span className="hidden lg:inline">Download</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
