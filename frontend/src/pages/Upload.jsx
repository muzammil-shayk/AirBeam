import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  X,
  Copy,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL + "/api/upload";

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setMessage("");
    setDownloadKey(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
      setDownloadKey(null);
    }
  };

  // Create an object URL for image previews
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Remove the selected file by resetting the state
  const handleRemoveFile = () => {
    resetState();
  };

  // Handle the file upload process
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setMessage("");

      // API call to the backend
      const res = await axios.post(API_URL, formData);

      if (res.status === 200) {
        const { downloadKey } = res.data;
        setDownloadKey(downloadKey);
        setMessage("File uploaded successfully! Share this key to download.");
        setFile(null);
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
    <div className=" text-gray-800 flex min-h-[calc(100vh-160px)] bg-beigelight items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl lg:w-full lg:max-w-lg p-6 sm:p-8 space-y-6">
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
              file
                ? "border-teal-500 bg-teal-50"
                : "border-gray-300 bg-gray-50 hover:border-teal-500 hover:bg-teal-50"
            }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />
          <div className="flex flex-col items-center justify-center">
            <UploadCloud
              className={`h-12 w-12 transition-colors duration-300 ${
                file ? "text-teal-600" : "text-gray-400"
              }`}
            />
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-semibold text-teal-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
          </div>
        </label>

        {/* File preview and upload button */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-12 w-12 object-cover rounded-md"
                  />
                ) : (
                  <FileText className="h-12 w-12 text-teal-500" />
                )}
                <span className="text-gray-800 font-medium truncate">
                  {file.name}
                </span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || downloadKey}
              className="w-full bg-teal-500 text-white font-semibold py-3 rounded-xl hover:bg-teal-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        )}

        {/* Download key display */}
        {downloadKey && (
          <div className="bg-teal-50 text-teal-800 p-4 rounded-xl space-y-3 shadow-inner">
            <p className="text-sm font-medium">
              File uploaded! Share this key to download:
            </p>
            <div className="flex items-center justify-between bg-teal-100 p-2 rounded-lg">
              <span className="font-mono text-lg font-bold tracking-wider truncate px-2">
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
