import React from "react";
import { Linkedin, Github, Mail, User } from "lucide-react"; // Import more icons
import namelogo from "../assets/airbeamlogo.svg";

const ExpandedFooter = () => {
  return (
    <footer className="w-full bg-teal-500 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <img
              src={namelogo}
              alt="AirBeam Logo"
              className="h-28 w-auto invert -mb-6 -mt-8 -ml-3"
            />
            <p className="text-xs opacity-90 -mt-2">
              Simple and secure no-login file sharing with AirBeam.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a
              href="https://www.linkedin.com/in/muhammad-muzammil-8771a4309/"
              className="text-white hover:text-teal-200 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="https://github.com/muzammil-shayk"
              className="text-white hover:text-teal-200 transition-colors"
              aria-label="GitHub"
            >
              <Github size={22} />
            </a>
            <a
              href="https://m-muzammil.vercel.app"
              className="text-white hover:text-teal-200 transition-colors"
              aria-label="Portfolio"
            >
              <User size={22} />
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-teal-400 text-center text-[10px] uppercase tracking-widest opacity-80">
          © 2026 Developed by M. Muzammil. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default ExpandedFooter;
