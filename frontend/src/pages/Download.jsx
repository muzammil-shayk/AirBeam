import React, { useState } from "react";
// Renamed the imported icon to avoid a naming conflict with the component
import { Download as DownloadIcon, X } from "lucide-react";

const Download = ({ initialDownloadKey }) => {
  const [keyInput, setKeyInput] = useState(initialDownloadKey || "");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  // New function to reset the component state
  const resetState = () => {
    setKeyInput("");
    setMessage("");
    setDownloading(false);
  };

  const handleDownload = () => {
    if (!keyInput) {
      setMessage("Please enter a download key.");
      return;
    }

    setDownloading(true);
    setMessage("Preparing download...");

    // Using window.open() to trigger the download in a new tab, which is
    // a better user experience than navigating the current page away.
    const downloadUrl = `http://localhost:5001/api/download/${keyInput}`;
    window.open(downloadUrl, "_blank");

    // The download starts in a new tab, so we can't reliably track it.
    // We'll reset the state after a short delay and provide a message.
    setTimeout(() => {
      setDownloading(false);
      setMessage("Download request sent! Check your browser's downloads.");
    }, 2000);
  };

  return (
    <div className="bg-beigelight text-gray-800 min-h-[calc(100vh-160px)] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Download Your File</h1>
          <p className="text-gray-500 mt-1">
            Enter the key to securely download your file.
          </p>
        </div>

        {/* Input area */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
          <p className="text-sm font-semibold text-gray-500 mb-4">
            Enter your download key
          </p>
          <input
            type="text"
            className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-lg border-2 border-gray-300 text-gray-800 outline-none focus:border-teal-500 transition-colors duration-300"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="e.g., F1A2B3C4"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={resetState}
            className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-red-500 transition-colors duration-300"
            disabled={!keyInput && !message && !downloading}
          >
            <X className="h-5 w-5" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || !keyInput}
            className="flex items-center space-x-2 bg-teal-500 text-white font-semibold py-3 px-6 cursor-pointer rounded-xl hover:bg-teal-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="h-5 w-5" />
            <span>{downloading ? "Preparing..." : "Download"}</span>
          </button>
        </div>

        {/* Message area */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              downloading ? "text-blue-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Download;
