import React, { useState } from "react";
import Navbar from "./components/NavBar.jsx";
import Upload from "./pages/Upload";
import Download from "./pages/Download";

const App = () => {
  // 🚨 State for navigation
  const [currentPage, setCurrentPage] = useState("upload");

  // 🚨 State for upload details, lifted from Upload.jsx to persist across page changes
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentPage === "upload") {
      // 🚨 Pass all the necessary state and setters as props to the Upload page
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
        />
      );
    }
    if (currentPage === "download") {
      // 🚨 Pass the downloadKey to the Download page
      return <Download downloadKey={downloadKey} />;
    }
    // Default to the upload page if no other page is selected
    return <Upload />;
  };

  return (
    <>
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      {renderPage()}
    </>
  );
};

export default App;
