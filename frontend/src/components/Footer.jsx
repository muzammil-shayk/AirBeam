import React from "react";
import { Linkedin, Github, User } from "lucide-react";
import logo from "../assets/airbeamlogo.svg";
import { FOOTER } from "../content.js";

const ICONS = {
  LinkedIn: <Linkedin size={22} aria-hidden="true" />,
  GitHub: <Github size={22} aria-hidden="true" />,
  Portfolio: <User size={22} aria-hidden="true" />,
};

const Footer = () => {
  return (
    <footer className="band mt-auto">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <img src={logo} alt="AirBeam" className="logo" />
            <p className="footer__tagline">{FOOTER.tagline}</p>
          </div>
          <ul className="footer__links">
            {FOOTER.links.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__link"
                  aria-label={label}
                >
                  {ICONS[label]}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="footer__legal">{FOOTER.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
