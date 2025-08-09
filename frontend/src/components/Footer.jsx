import React from "react";
import { Linkedin, Github, Mail } from "lucide-react"; // Import more icons

const ExpandedFooter = () => {
  return (
    // A multi-column footer with different sections for navigation, social links, and contact info.
    <footer className="w-full bg-teal-500 text-white py-12 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Company Info Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">AirBeam</h2>
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

        {/* Navigation Links Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Legal and Resources Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-200 transition-colors">
                Help Center
              </a>
            </li>
          </ul>
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
