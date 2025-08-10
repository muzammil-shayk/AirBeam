import React, { useState } from "react";
import Navbar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Upload from "./pages/Upload.jsx";
import Download from "./pages/Download.jsx";

const App = () => {
  const [currentPage, setCurrentPage] = useState("upload");
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
    <div className="flex flex-col h-screen">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default App;
