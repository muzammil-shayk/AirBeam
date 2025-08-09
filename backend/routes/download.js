import express from "express";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import FileMeta from "../models/FileMeta.js";

const router = express.Router();

// Route to handle file downloads using a unique key
router.get("/:downloadKey", async (req, res) => {
  const { downloadKey } = req.params;

  if (!downloadKey) {
    return res.status(400).json({ message: "Download key is missing." });
  }

  try {
    // Find the file metadata using the download key
    const fileMeta = await FileMeta.findOne({ downloadKey });

    if (!fileMeta) {
      return res
        .status(404)
        .json({ message: "File not found or key is invalid." });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Open a download stream using the GridFS ID from the metadata
    const downloadStream = bucket.openDownloadStream(fileMeta.gridFsId);

    // 🚨 FIX: Explicitly set the headers before piping the stream.
    // This is the most reliable way to ensure the browser gets the correct info.
    const filename = encodeURIComponent(fileMeta.originalName);
    const contentType = fileMeta.contentType || "application/octet-stream";

    // Log the headers to confirm they are being set correctly on the server side
    console.log("Setting headers for download:");
    console.log("Content-Type:", contentType);
    console.log(
      "Content-Disposition:",
      `attachment; filename="${filename}"; filename*=UTF-8''${filename}`
    );

    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
    });

    // Pipe the download stream directly to the response
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("GridFS download stream error:", err);
      // Ensure we don't try to send headers if they've already been sent
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: "An error occurred while streaming the file." });
      }
    });
  } catch (error) {
    console.error("Download route error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error." });
    }
  }
});

export default router;
