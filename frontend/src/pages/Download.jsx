import React, { useState, useEffect, useCallback } from "react";
import {
  Download as DownloadIcon,
  X,
  FileText,
  DownloadCloud,
  Clock,
} from "lucide-react";
import axios from "axios";
import JSZip from "jszip";
import CountdownTimer from "../components/CountdownTimer.jsx";
import SEOSection from "../components/SEOSection.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "https://airbeam-backend.onrender.com";

const Download = ({ initialDownloadKey }) => {
  const [keyInput, setKeyInput] = useState(initialDownloadKey || "");
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(false);
  const [files, setFiles] = useState([]);
  const [zippingAll, setZippingAll] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const handleFetchFiles = useCallback(async (key) => {
    if (!key) {
      setMessage("Please enter a download key.");
      return;
    }

    setFetching(true);
    setMessage("");
    setFiles([]);

    try {
      const res = await axios.get(`${API_URL}/api/download/info/${key}`);
      const fetchedFiles = res.data.files;
      setFiles(fetchedFiles);
      setIsExpired(false);
      if (fetchedFiles.length > 0) {
        setMessage("");
      } else {
        setMessage("No files found for this key.");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setMessage("Files not found or key is invalid.");
      } else {
        setMessage("Server error while fetching files.");
      }
    } finally {
      setFetching(false);
    }
  }, []);

  // Automatically fetch if a key was provided via URL
  useEffect(() => {
    if (initialDownloadKey) {
      handleFetchFiles(initialDownloadKey);
    }
  }, [initialDownloadKey, handleFetchFiles]);

  const resetState = () => {
    setKeyInput("");
    setMessage("");
    setFetching(false);
    setFiles([]);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleDownloadFile = (gridFsId) => {
    const downloadUrl = `${API_URL}/api/download/file/${gridFsId}`;
    window.open(downloadUrl, "_blank");
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;

    setZippingAll(true);
    setZipProgress(0);
    setMessage("Preparing your ZIP...");

    try {
      const zip = new JSZip();

      const downloadPromises = files.map(async (file, index) => {
        const response = await axios.get(
          `${API_URL}/api/download/file/${file.gridFsId}`,
          {
            responseType: "arraybuffer", // Important for downloading as blob
          },
        );
        zip.file(file.originalName, response.data);
        setZipProgress(Math.round(((index + 1) / files.length) * 100));
      });

      await Promise.all(downloadPromises);

      setMessage("Zipping files...");
      const content = await zip.generateAsync({ type: "blob" });

      // Using a simple download trick if file-saver isn't explicitly there
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AirBeam_Zip_${keyInput}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage("ZIP downloaded successfully!");
    } catch (err) {
      console.error("Download all failed:", err);
      setMessage("Failed to download all files. Please try individual files.");
    } finally {
      setZippingAll(false);
    }
  };

  return (
    <div className="bg-beigelight flex flex-col items-center py-8 px-4 sm:px-6 md:px-8">
      <div className="w-full min-h-[62vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {files.length > 0
                ? "Your Download is Ready"
                : "Secure File Download"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isExpired
                ? "This link has expired and files have been deleted."
                : files.length > 0
                  ? "Your ZIP is ready to download."
                  : "Enter the key to securely fetch your files."}
            </p>
          </div>

          {/* Input area - Hide if files are already fetched to act as a "ZIP preview" view */}
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
              <p className="text-sm font-semibold text-gray-500 mb-4">
                Enter your download key
              </p>
              <input
                type="text"
                className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-lg border-2 border-gray-300 text-gray-800 outline-none focus:border-teal-500 transition-colors duration-300"
                value={keyInput}
                onChange={(e) => {
                  const val = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                  setKeyInput(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keyInput && !fetching) {
                    handleFetchFiles(keyInput);
                  }
                }}
                placeholder="e.g., F1A2B3C4"
                maxLength={8}
              />
            </div>
          ) : (
            <div
              className={`flex flex-col items-center space-y-4 transition-opacity duration-500 ${isExpired ? "opacity-50 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div className="w-full flex justify-center">
                <CountdownTimer
                  createdAt={files[0]?.createdAt}
                  onExpire={() => setIsExpired(true)}
                  label="Deleting in"
                />
              </div>
              <div className="bg-teal-50 text-teal-800 p-4 rounded-xl shadow-inner text-center w-full">
                <span className="font-mono text-lg font-bold tracking-wider">
                  {keyInput}
                </span>
              </div>

              {files.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={zippingAll || isExpired}
                  className="w-full flex items-center justify-center space-x-2 bg-teal-500 text-white font-bold py-3 rounded-xl hover:bg-teal-600 transition-colors shadow-md disabled:opacity-50"
                  aria-label={
                    zippingAll
                      ? "Preparing your ZIP archive"
                      : "Download all files as a single ZIP archive"
                  }
                >
                  <DownloadIcon className="h-5 w-5" />
                  <span>
                    {zippingAll
                      ? `Downloading ZIP... ${zipProgress}%`
                      : "Download All as ZIP"}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div
              className={`space-y-3 max-h-64 overflow-y-auto pr-2 mt-4 transition-opacity duration-500 ${isExpired ? "opacity-30 pointer-events-none" : "opacity-100"}`}
            >
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-teal-500 transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden flex-1">
                    <FileText className="h-8 w-8 text-teal-500 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span
                        className="text-gray-800 font-medium truncate"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file.gridFsId)}
                    disabled={isExpired}
                    className="flex flex-shrink-0 items-center justify-center space-x-1 bg-teal-500 text-white p-2 px-3 rounded-lg hover:bg-teal-600 transition-colors ml-3 disabled:opacity-50"
                    title="Download File"
                    aria-label={`Download ${file.originalName}`}
                  >
                    <DownloadCloud className="h-4 w-4" />
                    <span className="text-sm font-semibold hidden sm:inline">
                      Save
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={resetState}
              className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-red-500 transition-colors duration-300"
              disabled={
                !keyInput && !message && !fetching && files.length === 0
              }
              aria-label="Clear input and reset page"
            >
              <X className="h-5 w-5" />
              <span>Clear</span>
            </button>

            {files.length === 0 && (
              <button
                onClick={() => handleFetchFiles(keyInput)}
                disabled={fetching || !keyInput}
                className="flex items-center space-x-2 bg-teal-500 text-white font-semibold py-3 px-6 cursor-pointer rounded-xl hover:bg-teal-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={
                  fetching
                    ? "Searching for files"
                    : "Find files associated with this key"
                }
              >
                <DownloadIcon className="h-5 w-5" />
                <span>{fetching ? "Searching..." : "Find Files"}</span>
              </button>
            )}
          </div>

          {message && (
            <p
              className={`mt-4 text-center font-medium ${
                fetching ? "text-blue-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      <SEOSection />
    </div>
  );
};

export default Download;
