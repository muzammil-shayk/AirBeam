import React, { useState } from "react";
import Navbar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Upload from "./pages/Upload.jsx";
import Download from "./pages/Download.jsx";

const App = () => {
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const lastUpload = sessionStorage.getItem("lastUpload");
    
    if (key && lastUpload) {
      try {
        const { downloadKey } = JSON.parse(lastUpload);
        if (key && downloadKey && key.toUpperCase() === downloadKey.toUpperCase()) {
          return "upload"; // Uploader is refreshing
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    return key ? "download" : "upload";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  
  const [downloadKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("key")?.toUpperCase() || null;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentPage === "upload") {
      return <Upload />;
    }
    if (currentPage === "download") {
      return <Download initialDownloadKey={downloadKey} />;
    }
    return <Upload />;
  };

  return (
    <div className="flex flex-col">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default App;
