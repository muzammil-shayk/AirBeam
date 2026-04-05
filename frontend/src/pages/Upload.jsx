import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  UploadCloud,
  X,
  Copy,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL + "/api/upload";

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 10) {
      setMessage("You can only upload a maximum of 10 files at once.");
      return;
    }

    const totalSize = [...files, ...selectedFiles].reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      setMessage("Total file size exceeds the 200MB limit.");
      return;
    }

    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      setMessage("");
      setDownloadKey(null);
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

    const totalSize = [...files, ...droppedFiles].reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      setMessage("Total file size exceeds the 200MB limit.");
      return;
    }

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      setMessage("");
      setDownloadKey(null);
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

  // Remove a specific file
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

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
        const { downloadKey } = res.data;
        setDownloadKey(downloadKey);
        setMessage("Files uploaded successfully! Share this key to download.");
        // We do NOT call resetState() completely here so the user can see the key.
        // We only clear the files to reset the input area.
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

  return (
    <div className=" text-gray-800 flex min-h-[calc(100vh-160px)] bg-beigelight items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Your File</h1>
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
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-semibold text-teal-600">
                Click to upload
              </span>{" "}
              or drag and drop multiple files
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

        {/* Download key display */}
        {downloadKey && (
          <div className="bg-teal-50 text-teal-800 p-4 rounded-xl space-y-4 shadow-inner">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-sm font-medium">Scan to open on your phone:</p>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-teal-100 mt-2">
                <img 
                  src={`https://airqr.vercel.app/api/qr?data=${encodeURIComponent(`${window.location.origin}/?key=${downloadKey}`)}&color=%23000000&margin=2`} 
                  alt="Download QR Code" 
                  className="w-40 h-40 object-contain"
                />
              </div>
            </div>

            <div className="border-t border-teal-200 my-2 pt-2 text-center text-sm font-medium">Download Key</div>

            <div className="flex items-center justify-between bg-teal-100 p-2 rounded-lg">
              <span className="font-mono text-lg font-bold tracking-wider truncate px-2 text-teal-900">
                {downloadKey}
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="flex-shrink-0 bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 transition-colors"
                title="Copy key to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Message area for success and errors */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              downloadKey ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Upload;
