import React, { useState, useEffect, useCallback } from "react";
import {
  Download as DownloadIcon,
  X,
  FileText,
  DownloadCloud,
} from "lucide-react";
import axios from "axios";
import JSZip from "jszip";
import CountdownTimer from "../components/CountdownTimer.jsx";
import SEOSection from "../components/SEOSection.jsx";
import HomeScreenHint from "../components/HomeScreenHint.jsx";
import { DOWNLOAD } from "../content.js";

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

  const ready = files.length > 0;

  return (
    <div>
      <div className="stage">
        <div className="panel">
          {/* Title */}
          <div className="panel__head">
            <h1 className="panel__title">
              {ready ? DOWNLOAD.titleReady : DOWNLOAD.titleIdle}
            </h1>
            <p className="panel__sub">
              {isExpired
                ? DOWNLOAD.subExpired
                : ready
                  ? DOWNLOAD.subReady
                  : DOWNLOAD.subIdle}
            </p>
          </div>

          {/* Input area - Hide if files are already fetched to act as a "ZIP preview" view */}
          {!ready ? (
            <div className="keybox">
              <label htmlFor="downloadKey" className="keybox__label">
                {DOWNLOAD.inputLabel}
              </label>
              <input
                id="downloadKey"
                type="text"
                className="field"
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
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>
          ) : (
            <div
              className={`flex flex-col gap-4 transition-opacity duration-500 ${isExpired ? "opacity-50 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <CountdownTimer
                createdAt={files[0]?.createdAt}
                onExpire={() => setIsExpired(true)}
                label="Deleting in"
              />
              <div className="key key--solo">
                <span className="key__value num">{keyInput}</span>
              </div>

              {files.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={zippingAll || isExpired}
                  aria-busy={zippingAll}
                  className="btn btn--block"
                  aria-label={
                    zippingAll
                      ? "Preparing your ZIP archive"
                      : "Download all files as a single ZIP archive"
                  }
                >
                  <DownloadIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="num">
                    {zippingAll
                      ? `Downloading ZIP... ${zipProgress}%`
                      : "Download All as ZIP"}
                  </span>
                  {zippingAll && (
                    <span
                      className="btn__fill"
                      style={{ width: `${zipProgress}%` }}
                    />
                  )}
                </button>
              )}
            </div>
          )}

          {/* File List */}
          {ready && (
            <div
              className={`rows transition-opacity duration-500 ${isExpired ? "opacity-30 pointer-events-none" : "opacity-100"}`}
            >
              {files.map((file, idx) => (
                <div key={idx} className="row">
                  <div className="row__main">
                    <FileText
                      className="row__icon"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div className="row__text">
                      <span className="row__name" title={file.originalName}>
                        {file.originalName}
                      </span>
                      <span className="row__meta num">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file.gridFsId)}
                    disabled={isExpired}
                    className="btn btn--sm"
                    title="Download File"
                    aria-label={`Download ${file.originalName}`}
                  >
                    <DownloadCloud className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetState}
              className="link"
              disabled={!keyInput && !message && !fetching && files.length === 0}
              aria-label="Clear input and reset page"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Clear</span>
            </button>

            {files.length === 0 && (
              <button
                onClick={() => handleFetchFiles(keyInput)}
                disabled={fetching || !keyInput}
                aria-busy={fetching}
                className="btn"
                aria-label={
                  fetching
                    ? "Searching for files"
                    : "Find files associated with this key"
                }
              >
                <DownloadIcon className="h-5 w-5" aria-hidden="true" />
                <span>{fetching ? "Searching..." : "Find Files"}</span>
              </button>
            )}
          </div>

          {message && (
            <p
              role="status"
              className="status"
              data-tone={fetching ? "ok" : "error"}
            >
              {message}
            </p>
          )}
        </div>

        <HomeScreenHint />
      </div>

      <SEOSection />
    </div>
  );
};

export default Download;
