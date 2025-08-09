import React, { useState } from "react";

const Download = ({ downloadKey: initialDownloadKey }) => {
  const [keyInput, setKeyInput] = useState(initialDownloadKey || "");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (!keyInput) {
      setMessage("Please enter a download key.");
      return;
    }

    setDownloading(true);
    setMessage("Preparing download...");

    // 🚨 FIX: We are no longer using axios. Instead, we are telling the browser
    // to navigate directly to the download URL. This forces the browser to
    // handle the download natively and respects the server's headers.
    const downloadUrl = `http://localhost:5001/api/download/${keyInput}`;
    window.location.href = downloadUrl;

    // We can't detect a successful download this way, so we just reset the state after a short delay.
    setTimeout(() => {
      setDownloading(false);
      setMessage("Download request sent. Check your browser's downloads.");
    }, 2000); // Give the download time to start
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-beigelight`}
    >
      <div className="bg-white shadow-lg rounded-xl w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray">
          Download Your File
        </h1>

        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-48 relative border-beigedark">
          <p className="text-lg font-semibold text-gray">
            Enter your download key
          </p>
          <input
            type="text"
            className="mt-4 text-center text-lg font-mono tracking-widest p-2 rounded-lg border-2 border-beigedark text-gray outline-none focus:border-teal transition-colors duration-300"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="e.g., F1A2B3C4"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-4 py-2 rounded-lg text-white transition disabled:opacity-50 bg-teal`}
          >
            {downloading ? "Preparing..." : "Download"}
          </button>
        </div>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Download;
