import React from "react";
import { Linkedin, Github, Mail } from "lucide-react"; // Import more icons
import namelogo from "../assets/airbeamlogo.svg";

const ExpandedFooter = () => {
  return (
    <footer className="w-full bg-teal-500 text-white py-10 mt-auto">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div>
          <img
            src={namelogo}
            alt="AirBeam Logo"
            className="h-44 w-auto invert -mb-12 -mt-16 lg:ml-0 -ml-3"
          />
          <p className="text-sm">
            A simple and secure way to share files with a key.
          </p>
          <div className="flex space-x-4 mt-4">
            <a
              href="https://www.linkedin.com/in/muhammad-muzammil-8771a4309/"
              className="text-white hover:text-teal-200 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://github.com/muzammil-shayk"
              className="text-white hover:text-teal-200 transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-4 border-t border-teal-400 text-center text-sm">
        <p className="font-medium">
          © 2025 Developed by M. Muzammil. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default ExpandedFooter;
