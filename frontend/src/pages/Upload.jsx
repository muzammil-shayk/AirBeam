import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { UploadCloud, X, Copy, FileText, Folder } from "lucide-react";
import CountdownTimer from "../components/CountdownTimer.jsx";
import SEOSection from "../components/SEOSection.jsx";
import HomeScreenHint from "../components/HomeScreenHint.jsx";
import { UPLOAD, LIMITS } from "../content.js";

// Files nobody means to share. Dropped silently when they ride along in a folder.
const JUNK = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

const baseName = (path) => path.slice(path.lastIndexOf("/") + 1);
const entryKey = (e) => `${e.path}|${e.file.size}|${e.file.lastModified}`;
const toEntry = (file) => ({ file, path: file.webkitRelativePath || file.name });

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// readEntries returns the directory in batches (about 100): call it until it comes back empty.
const readAll = (reader) =>
  new Promise((resolve, reject) => {
    const all = [];
    const next = () =>
      reader.readEntries((batch) => {
        if (batch.length === 0) resolve(all);
        else {
          all.push(...batch);
          next();
        }
      }, reject);
    next();
  });

// Flatten a dropped file or directory entry into { file, path } pairs. Empty folders add nothing.
const walk = async (entry, out) => {
  if (out.length > LIMITS.maxFiles) return; // already over the cap, stop reading
  if (entry.isFile) {
    const file = await new Promise((res, rej) => entry.file(res, rej));
    out.push({ file, path: entry.fullPath.replace(/^\//, "") });
  } else if (entry.isDirectory) {
    for (const child of await readAll(entry.createReader())) {
      await walk(child, out);
    }
  }
};

// Folder picking needs webkitdirectory and a desktop-style pointer; phones only get "Choose files".
const canPickFolders = () =>
  "webkitdirectory" in document.createElement("input") &&
  !window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// On Android, "*/*" makes Chrome open a chooser with Camera/Camcorder/Recorder first.
// "application/octet-stream" skips those and goes straight to the file apps (Samsung My Files, Files)
// while still allowing every file type. Other platforms would filter by it, so Android only.
const FILE_ACCEPT = /android/i.test(navigator.userAgent)
  ? "application/octet-stream"
  : "*/*";

const Upload = () => {
  // Single source of truth for the reverse (clear) animation: also fed to CSS as --reverse-ms below.
  const REVERSE_ANIMATION_MS = 1000;
  // Each staged item is { file, path }; path is the relative path ("photos/a.jpg") or the plain name.
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadKey, setDownloadKey] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdAt, setCreatedAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isResetAnimating, setIsResetAnimating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [folderPicker] = useState(canPickFolders);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const clearTimerRef = useRef(null);
  const filesRef = useRef(files);

  const API_URL = import.meta.env.VITE_API_URL + "/api/upload";

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Add picked or dropped items, enforcing the 1000-file and 200MB limits.
  const addEntries = (incoming) => {
    const current = filesRef.current;
    const seen = new Set(current.map(entryKey));
    const fresh = incoming.filter((e) => {
      if (JUNK.has(baseName(e.path))) return false;
      const k = entryKey(e);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (current.length + fresh.length > LIMITS.maxFiles) {
      setMessage(UPLOAD.tooManyFiles);
      return;
    }

    const totalSize = [...current, ...fresh].reduce(
      (acc, e) => acc + e.file.size,
      0,
    );
    if (totalSize > LIMITS.maxBytes) {
      setMessage(UPLOAD.tooBig);
      return;
    }

    if (fresh.length > 0) {
      setFiles((prev) => [...prev, ...fresh]);
      setMessage("");
      setDownloadKey(null);
      setCreatedAt(null);
      setIsExpired(false);
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
    }
  };

  // Used by both pickers; folder picks carry webkitRelativePath.
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map(toEntry);
    e.target.value = "";
    addEntries(selected);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);

    // Both reads must happen before the first await: the drag data is cleared afterwards.
    const droppedFiles = Array.from(e.dataTransfer.files);
    const entries = Array.from(e.dataTransfer.items || [])
      .filter((item) => item.kind === "file")
      .map((item) => item.webkitGetAsEntry?.())
      .filter(Boolean);

    if (!entries.some((entry) => entry.isDirectory)) {
      addEntries(droppedFiles.map(toEntry));
      return;
    }

    setScanning(true);
    try {
      const found = [];
      for (const entry of entries) await walk(entry, found);
      addEntries(found);
    } catch (err) {
      console.error("Reading dropped folder failed:", err);
      setMessage("Could not read the dropped folder. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  // The staged list: loose files one row each, a folder as one row.
  const rows = useMemo(() => {
    const out = [];
    const folders = new Map();
    files.forEach((entry, index) => {
      const slash = entry.path.indexOf("/");
      if (slash === -1) {
        out.push({ kind: "file", key: `f${index}`, index, entry });
        return;
      }
      const name = entry.path.slice(0, slash);
      let group = folders.get(name);
      if (!group) {
        group = { kind: "folder", key: `d${name}`, name, count: 0, size: 0 };
        folders.set(name, group);
        out.push(group);
      }
      group.count += 1;
      group.size += entry.file.size;
    });
    return out;
  }, [files]);

  const totalSize = useMemo(
    () => files.reduce((acc, e) => acc + e.file.size, 0),
    [files],
  );

  // Create an object URL for image previews (loose images only: a folder never opens 500 of them)
  useEffect(() => {
    const newPreviewUrls = {};
    files.forEach((entry, index) => {
      if (!entry.path.includes("/") && entry.file.type.startsWith("image/")) {
        newPreviewUrls[index] = URL.createObjectURL(entry.file);
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
          setMessage(UPLOAD.successMessage);
        } else {
          sessionStorage.removeItem("lastUpload");
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        sessionStorage.removeItem("lastUpload");
      }
    }
  }, []);

  const dropStaleKey = () => {
    if (downloadKey) {
      setDownloadKey(null);
      setCreatedAt(null);
      setMessage("");
      sessionStorage.removeItem("lastUpload");
      window.history.replaceState({}, document.title, "/");
    }
  };

  // Remove a specific file
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    dropStaleKey();
  };

  // Remove a whole staged folder
  const handleRemoveFolder = (name) => {
    setFiles((prev) => prev.filter((e) => !e.path.startsWith(`${name}/`)));
    dropStaleKey();
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
      // The filename carries the relative path so the server can rebuild folders.
      files.forEach(({ file, path }) => {
        formData.append("files", file, path);
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
        const { downloadKey, metas, zipped } = res.data;
        setDownloadKey(downloadKey);

        let serverCreatedAt = null;
        if (metas && metas.length > 0) {
          serverCreatedAt = metas[0].createdAt;
          setCreatedAt(serverCreatedAt);
        }

        setIsExpired(false);
        setMessage(zipped ? UPLOAD.zippedMessage : UPLOAD.successMessage);

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
        if (folderInputRef.current) {
          folderInputRef.current.value = "";
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

  const openFilePicker = (e) => {
    // A click on the zone itself opens the file picker; its buttons do their own thing.
    if (!e.target.closest("button")) fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className="stage"
        style={{ "--reverse-ms": `${REVERSE_ANIMATION_MS}ms` }}
      >
        <div className="pair">
          {/* Main Upload Card */}
          <div className="panel">
            {/* Title */}
            <div className="panel__head">
              <h1 className="panel__title">{UPLOAD.title}</h1>
              <p className="panel__sub">{UPLOAD.sub}</p>
            </div>

            {/* File upload area */}
            <div
              className="dropzone"
              data-has-files={files.length > 0 ? "" : undefined}
              data-drag={dragging ? "true" : undefined}
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileUpload"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={FILE_ACCEPT}
              />
              {folderPicker && (
                <input
                  type="file"
                  id="folderUpload"
                  multiple
                  webkitdirectory=""
                  ref={folderInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              )}
              <UploadCloud
                className="dropzone__icon"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="dropzone__hint" aria-live="polite">
                <strong>
                  {scanning ? (
                    UPLOAD.reading
                  ) : (
                    <>
                      <span className="sm:hidden">{UPLOAD.pick.mobile}</span>
                      <span className="hidden sm:inline">
                        {UPLOAD.pick.desktop}
                      </span>
                    </>
                  )}
                </strong>
              </p>
              <div className="dropzone__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {UPLOAD.chooseFiles}
                </button>
                {folderPicker && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    <Folder className="h-4 w-4" aria-hidden="true" />
                    {UPLOAD.chooseFolder}
                  </button>
                )}
              </div>
            </div>

            {/* File preview and upload button */}
            {files.length > 0 && (
              <div className="staged">
                <p className="staged__summary num">
                  <span>
                    {files.length} file{files.length > 1 ? "s" : ""}
                  </span>
                  <span>
                    {formatBytes(totalSize)} of{" "}
                    {formatBytes(LIMITS.maxBytes).replace(".0", "")}
                  </span>
                </p>
                <div className="rows">
                  {rows.map((row) =>
                    row.kind === "folder" ? (
                      <div key={row.key} className="row">
                        <div className="row__main">
                          <Folder
                            className="row__icon"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          <div className="row__text">
                            <span className="row__name" title={row.name}>
                              {row.name}/
                            </span>
                            <span className="row__meta num">
                              {row.count} file{row.count > 1 ? "s" : ""} ·{" "}
                              {formatBytes(row.size)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFolder(row.name)}
                          className="icon-btn"
                          title="Remove folder"
                          aria-label={`Remove folder ${row.name}`}
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div key={row.key} className="row">
                        <div className="row__main">
                          {previewUrls[row.index] ? (
                            <img
                              src={previewUrls[row.index]}
                              alt="preview"
                              className="row__thumb"
                            />
                          ) : (
                            <FileText
                              className="row__icon"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          )}
                          <div className="row__text">
                            <span className="row__name" title={row.entry.path}>
                              {row.entry.file.name}
                            </span>
                            <span className="row__meta num">
                              {formatBytes(row.entry.file.size)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(row.index)}
                          className="icon-btn"
                          title="Remove file"
                          aria-label={`Remove ${row.entry.file.name}`}
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || scanning || downloadKey}
                  aria-busy={uploading}
                  className="btn btn--block"
                  aria-label={
                    uploading
                      ? "Uploading in progress"
                      : `Upload ${files.length} selected files`
                  }
                >
                  {uploading ? (
                    <>
                      <span className="num">{`Uploading... ${uploadProgress}%`}</span>
                      <span
                        className="btn__fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </>
                  ) : (
                    `Upload ${files.length} File${files.length > 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            )}

            {message && (
              <div className="flex flex-col items-center gap-1">
                <p
                  role="status"
                  className="status"
                  data-tone={downloadKey ? "ok" : "error"}
                >
                  {message}
                </p>

                {/* Contextual Clear Button */}
                <button
                  onClick={handleClearSession}
                  disabled={isResetAnimating}
                  className="link"
                  aria-label="Clear session"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* Success panel: opens and closes in REVERSE_ANIMATION_MS */}
          <div
            className="reveal"
            data-open={downloadKey ? "true" : "false"}
            aria-hidden={downloadKey ? undefined : true}
            inert={!downloadKey}
          >
            <div className="reveal__inner">
              <div className={`panel ${isExpired ? "is-expired" : ""}`}>
                <div className="live">
                  <CountdownTimer
                    createdAt={createdAt}
                    onExpire={() => setIsExpired(true)}
                    label="Deleting in"
                  />

                  <p className="live__label">{UPLOAD.scanLabel}</p>
                  <div className="qr">
                    <img
                      src={`https://airqr.vercel.app/api/qr?data=${encodeURIComponent(`${window.location.origin}/?key=${downloadKey}`)}&color=%23000000&margin=2`}
                      alt={`QR code to download files with key ${downloadKey}`}
                    />
                  </div>

                  <p className="live__heading">{UPLOAD.keyLabel}</p>
                  <div className="key">
                    <span className="key__value num">{downloadKey}</span>
                    <button
                      onClick={handleCopyToClipboard}
                      className="btn btn--icon"
                      title="Copy key to clipboard"
                      aria-label="Copy download key to clipboard"
                    >
                      <Copy className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="live__foot">{UPLOAD.retention}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="caption">{UPLOAD.caption}</p>
        <HomeScreenHint />
      </div>

      <SEOSection />
    </div>
  );
};

export default Upload;
