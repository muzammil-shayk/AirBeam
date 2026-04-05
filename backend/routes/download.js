import express from "express";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import FileMeta from "../models/FileMeta.js";

const router = express.Router();

// Route to get list of files for a specific key
router.get("/info/:downloadKey", async (req, res) => {
  const { downloadKey } = req.params;

  if (!downloadKey) {
    return res.status(400).json({ message: "Download key is missing." });
  }

  try {
    const fileMetas = await FileMeta.find({ downloadKey });

    if (!fileMetas || fileMetas.length === 0) {
      return res
        .status(404)
        .json({ message: "Files not found or key is invalid." });
    }

    res.json({ files: fileMetas });
  } catch (error) {
    console.error("Info route error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to handle individual file downloads using GridFS ID
router.get("/file/:gridFsId", async (req, res) => {
  const { gridFsId } = req.params;

  if (!gridFsId) {
    return res.status(400).json({ message: "File ID is missing." });
  }

  try {
    // Find the file metadata using the GridFS ID
    const fileMeta = await FileMeta.findOne({ gridFsId });

    if (!fileMeta) {
      return res.status(404).json({ message: "File not found." });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Open a download stream using the GridFS ID from the metadata
    const objectId = new mongoose.Types.ObjectId(gridFsId);
    const downloadStream = bucket.openDownloadStream(objectId);

    const filename = encodeURIComponent(fileMeta.originalName);
    const contentType = fileMeta.contentType || "application/octet-stream";

    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
    });

    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("GridFS download stream error:", err);
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
