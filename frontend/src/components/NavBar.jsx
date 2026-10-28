import React from "react";
import { Upload, Download } from "lucide-react";
import logo from "../assets/airbeamlogo.svg";
import { NAV } from "../content.js";

const Navbar = ({ currentPage, onPageChange }) => {
  const tabs = [
    { page: "upload", label: NAV.upload, icon: <Upload size={18} aria-hidden="true" /> },
    { page: "download", label: NAV.download, icon: <Download size={18} aria-hidden="true" /> },
  ];

  return (
    <nav className="band nav" aria-label="Primary">
      <div className="nav__inner">
        <img src={logo} alt="AirBeam" className="logo" />
        <div className="tabs">
          {tabs.map(({ page, label, icon }) => (
            <button
              key={page}
              className="tab"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
