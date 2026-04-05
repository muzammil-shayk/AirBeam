import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  UploadCloud,
  X,
  Copy,
  Image as ImageIcon,
  FileText,
  Clock,
} from "lucide-react";
import CountdownTimer from "../components/CountdownTimer.jsx";
import SEOSection from "../components/SEOSection.jsx";

const Upload = () => {
  const REVERSE_ANIMATION_MS = 1000;
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdAt, setCreatedAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isResetAnimating, setIsResetAnimating] = useState(false);
  const fileInputRef = useRef(null);
  const clearTimerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL + "/api/upload";

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 10) {
      setMessage("You can only upload a maximum of 10 files at once.");
      return;
    }

    const totalSize = [...files, ...selectedFiles].reduce(
      (acc, f) => acc + f.size,
      0,
    );
    if (totalSize > 200 * 1024 * 1024) {
      setMessage("Total file size exceeds the 200MB limit.");
      return;
    }

    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      setMessage("");
      setDownloadKey(null);
      setCreatedAt(null);
      setIsExpired(false);
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);

    if (files.length + droppedFiles.length > 10) {
      setMessage("You can only upload a maximum of 10 files at once.");
      return;
    }

    const totalSize = [...files, ...droppedFiles].reduce(
      (acc, f) => acc + f.size,
      0,
    );
    if (totalSize > 200 * 1024 * 1024) {
      setMessage("Total file size exceeds the 200MB limit.");
      return;
    }

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      setMessage("");
      setDownloadKey(null);
      setCreatedAt(null);
      setIsExpired(false);
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
    }
  };

  // Create an object URL for image previews
  useEffect(() => {
    const newPreviewUrls = {};
    files.forEach((f, index) => {
      if (f.type.startsWith("image/")) {
        newPreviewUrls[index] = URL.createObjectURL(f);
      }
    });
    setPreviewUrls(newPreviewUrls);

    return () => {
      Object.values(newPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Handle Enter key for upload
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (files.length > 0 && !uploading && !downloadKey) {
          handleUpload();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, uploading, downloadKey]);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const lastUpload = sessionStorage.getItem("lastUpload");
    if (lastUpload) {
      try {
        const { downloadKey, createdAt } = JSON.parse(lastUpload);

        // Check if expired (5 mins = 300s)
        const createdTime = new Date(createdAt).getTime();
        const expirationTime = createdTime + 5 * 60 * 1000;

        if (Date.now() < expirationTime) {
          setDownloadKey(downloadKey);
          setCreatedAt(createdAt);
          setIsExpired(false);
          setMessage(
            "Files uploaded successfully! Share this key to download.",
          );
        } else {
          sessionStorage.removeItem("lastUpload");
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        sessionStorage.removeItem("lastUpload");
      }
    }
  }, []);

  // Remove a specific file
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (downloadKey) {
      setDownloadKey(null);
      setCreatedAt(null);
      setMessage("");
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
    }
  };

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  // Handle the file upload process
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select files first.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // API call to the backend
      const res = await axios.post(API_URL, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (res.status === 200) {
        const { downloadKey, metas } = res.data;
        setDownloadKey(downloadKey);

        let serverCreatedAt = null;
        if (metas && metas.length > 0) {
          serverCreatedAt = metas[0].createdAt;
          setCreatedAt(serverCreatedAt);
        }

        setIsExpired(false);
        setMessage("Files uploaded successfully! Share this key to download.");

        // Save session
        sessionStorage.setItem(
          "lastUpload",
          JSON.stringify({
            downloadKey,
            createdAt: serverCreatedAt,
          }),
        );

        // Update URL
        window.history.pushState(null, "", `/?key=${downloadKey}`);

        // Clear inputs
        setFiles([]);
        setPreviewUrls({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Copy the download key to the clipboard
  const handleCopyToClipboard = () => {
    const tempInput = document.createElement("input");
    tempInput.value = downloadKey;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    setMessage("Key copied to clipboard!");
  };

  const handleClearSession = () => {
    if (!downloadKey) {
      setMessage("");
      setCreatedAt(null);
      setIsExpired(false);
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
      return;
    }

    setIsResetAnimating(true);
    setDownloadKey(null);
    setCreatedAt(null);
    setIsExpired(false);

    clearTimerRef.current = setTimeout(() => {
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
      setMessage("");
      setIsResetAnimating(false);
      clearTimerRef.current = null;
    }, REVERSE_ANIMATION_MS);
  };

  return (
    <div className="bg-beigelight flex flex-col items-center py-8 px-4 sm:px-6 md:px-8 overflow-hidden">
      <div className="w-full min-h-[62vh] flex items-center justify-center">
        <div
          className={`flex flex-col lg:flex-row w-full transition-all duration-1000 ease-in-out justify-center items-center lg:items-start ${downloadKey ? "gap-8 max-w-6xl" : "gap-0 max-w-lg"}`}
        >
          {/* Main Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 space-y-6 flex-shrink-0 transition-all duration-500 z-10 self-center lg:self-start">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Upload Your File
              </h1>
              <p className="text-gray-500 mt-1">
                Securely share files with a simple key.
              </p>
            </div>

            {/* File upload area */}
            <label
              htmlFor="fileUpload"
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition duration-300 ease-in-out
            ${
              files.length > 0
                ? "border-teal-500 bg-teal-50"
                : "border-gray-300 bg-gray-50 hover:border-teal-500 hover:bg-teal-50"
            }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileUpload"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
              />
              <div className="flex flex-col items-center justify-center">
                <UploadCloud
                  className={`h-12 w-12 transition-colors duration-300 ${
                    files.length > 0 ? "text-teal-600" : "text-gray-400"
                  }`}
                />
                <p className="mt-3 text-sm text-gray-500 text-center">
                  <span className="font-semibold text-teal-600 block sm:inline">
                    <span className="sm:hidden">Tap to upload</span>
                    <span className="hidden sm:inline">Click to upload</span>
                  </span>
                  <span className="hidden sm:inline">
                    {" "}
                    or drag and drop multiple files
                  </span>
                </p>
              </div>
            </label>

            {/* File preview and upload button */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {files.map((f, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {previewUrls[index] ? (
                          <img
                            src={previewUrls[index]}
                            alt="preview"
                            className="h-10 w-10 object-cover rounded-md flex-shrink-0"
                          />
                        ) : (
                          <FileText className="h-10 w-10 text-teal-500 flex-shrink-0" />
                        )}
                        <span className="text-gray-800 font-medium truncate">
                          {f.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                        title="Remove file"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || downloadKey}
                  className="w-full bg-teal-500 text-white font-semibold py-3 rounded-xl hover:bg-teal-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  aria-label={
                    uploading
                      ? "Uploading in progress"
                      : `Upload ${files.length} selected files`
                  }
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <span className="relative z-10">
                        {`Uploading... ${uploadProgress}%`}
                      </span>
                      <div
                        className="absolute left-0 top-0 h-full bg-teal-600 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  ) : (
                    `Upload ${files.length} File${files.length > 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            )}

            {message && (
              <div className="mt-4 flex flex-col items-center">
                <p
                  className={`text-center font-medium ${
                    downloadKey ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {message}
                </p>

                {/* Contextual Clear Button */}
                <button
                  onClick={handleClearSession}
                  disabled={isResetAnimating}
                  className="mt-2 text-xs sm:text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
                  aria-label="Clear session"
                >
                  <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* Success Card Wrapper - Handles the glide and expansion animation */}
          <div
            className={`transition-all duration-1000 ease-in-out overflow-hidden w-full flex-shrink-0 rounded-2xl shadow-xl 
        ${
          downloadKey
            ? "max-h-[800px] opacity-100 lg:max-w-lg lg:max-h-full lg:translate-x-0"
            : "max-h-0 opacity-0 lg:max-w-0 lg:max-h-0 lg:translate-x-12"
        }`}
          >
            <div
              className={`bg-white w-full max-w-lg p-6 sm:p-8 space-y-6 transition-all duration-500 ${isExpired ? "grayscale opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <div className="bg-teal-50 text-teal-800 p-6 rounded-xl space-y-6 shadow-inner">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-full flex justify-center pb-2">
                    <CountdownTimer
                      createdAt={createdAt}
                      onExpire={() => setIsExpired(true)}
                      label="Deleting in"
                    />
                  </div>
                  <p className="text-sm font-bold text-teal-900">
                    Scan to open on your phone
                  </p>
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-teal-100 transition-all duration-700 hover:scale-105 hover:shadow-lg">
                    <img
                      src={`https://airqr.vercel.app/api/qr?data=${encodeURIComponent(`${window.location.origin}/?key=${downloadKey}`)}&color=%23000000&margin=2`}
                      alt={`QR code to download files with key ${downloadKey}`}
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>

                <div className="border-t border-teal-200 my-4 pt-4 text-center text-xs uppercase font-extrabold tracking-widest text-teal-600">
                  Download Key
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-teal-100 shadow-sm">
                  <span className="font-mono text-xl font-bold tracking-widest truncate px-2 text-teal-900">
                    {downloadKey}
                  </span>
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex-shrink-0 bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
                    title="Copy key to clipboard"
                    aria-label="Copy download key to clipboard"
                  >
                    <Copy className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-center text-xs text-teal-600 font-medium pt-2">
                  Files are stored securely for 5 minutes only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SEOSection />
    </div>
  );
};

export default Upload;
