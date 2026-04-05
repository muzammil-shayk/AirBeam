import React, { useState, useEffect } from "react";
import Navbar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Upload from "./pages/Upload.jsx";
import Download from "./pages/Download.jsx";

const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("key") ? "download" : "upload";
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("key")?.toUpperCase() || null;
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (window.location.search.includes("key=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetState = () => {
    setFile(null);
    setUploading(false);
    setMessage("");
    setDownloadKey(null);
    setPreviewUrl(null);
  };

  const renderPage = () => {
    if (currentPage === "upload") {
      return (
        <Upload
          file={file}
          setFile={setFile}
          uploading={uploading}
          setUploading={setUploading}
          message={message}
          setMessage={setMessage}
          downloadKey={downloadKey}
          setDownloadKey={setDownloadKey}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          resetState={resetState}
        />
      );
    }
    if (currentPage === "download") {
      return <Download initialDownloadKey={downloadKey} resetState={resetState} />;
    }
    return <Upload />;
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default App;
