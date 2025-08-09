import React, { useEffect, useState } from "react";
import axios from "axios";

// 🚨 The component now receives state and setters as props from App.jsx
const Upload = ({
  file,
  setFile,
  uploading,
  setUploading,
  message,
  setMessage,
  downloadKey,
  setDownloadKey,
}) => {
  // We still use local state for the preview URL, as it's a temporary, visual detail.
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage("");
    setDownloadKey(null);
  };

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

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setDownloadKey(null);
  };

  async function uploadFile(formData) {
    const res = await axios.post("http://localhost:5001/api/upload", formData);
    return res;
  }

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

      const res = await uploadFile(formData);

      if (res.status === 200) {
        setDownloadKey(res.data.downloadKey);
        setMessage("File uploaded successfully! Share the key below.");
        setFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyToClipboard = () => {
    // 🚨 We use document.execCommand instead of navigator.clipboard.writeText
    // due to potential iframe restrictions in some environments.
    const tempInput = document.createElement("input");
    tempInput.value = downloadKey;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    setMessage("Key copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold text-gray text-center mb-6">
          Upload Your File
        </h1>

        <label
          htmlFor="fileUpload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-black rounded-lg h-48 cursor-pointer hover:border-teal-500 transition duration-300 relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-teal-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"
            />
          </svg>
          <p className="text-gray">Click or drag a file here</p>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />
        </label>

        {file && previewUrl && (
          <div className="mt-4 flex flex-col items-center">
            <img
              src={previewUrl}
              alt="preview"
              className="max-h-40 rounded-md shadow-md"
            />
            <button
              onClick={handleRemoveFile}
              className="mt-2 text-red-500 hover:underline text-xs"
            >
              Remove File
            </button>
          </div>
        )}

        {file && !previewUrl && (
          <div className="mt-4 flex justify-between items-center border p-3 rounded-md shadow-inner bg-gray-50">
            <span className="text-gray-800">{file.name}</span>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:underline text-xs"
            >
              Remove
            </button>
          </div>
        )}

        {downloadKey && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-semibold text-gray-800">
              Share this key to download your file:
            </p>
            <div className="flex items-center justify-center mt-2">
              <span className="font-mono text-xl tracking-widest text-teal-600 border-b-2 border-dashed border-teal-300 px-4 py-1">
                {downloadKey}
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="ml-4 p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading || downloadKey}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Upload;
