import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Assuming you have imported Footer
import Upload from "./pages/Upload";
import Download from "./pages/Download";

const App = () => {
  const [currentPage, setCurrentPage] = useState("upload");

  // All application state is managed here
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      return <Download downloadKey={downloadKey} resetState={resetState} />;
    }
    return <Upload />;
  };

  return (
    // 🚨 The layout is now set up here using a parent div with flex properties.
    <div className="flex flex-col h-screen">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      {/* 🚨 The main content area now has flex-grow to fill the available space. */}
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default App;
