import React from "react";

const Footer = () => {
  return (
    // The footer is styled to match the navbar's teal background and text color.
    // Flexbox is used to center the content both vertically and horizontally.
    <footer className="w-full bg-teal-500 text-gray py-5 mt-auto">
      <div className="container mx-auto flex items-center justify-center">
        {/* The text is centered within the footer. */}
        <p className="text-center font-extrabold">Developed by M. Muzammil</p>
      </div>
    </footer>
  );
};

export default Footer;
