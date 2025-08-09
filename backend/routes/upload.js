import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import FileMeta from "../models/FileMeta.js";
import crypto from "crypto";

const router = express.Router();
const storage = multer.memoryStorage();

// Configure multer with file size limits
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
});

router.post(
  "/",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err);
        return res
          .status(400)
          .json({ error: "File upload failed", details: err.message });
      } else if (err) {
        console.error("Unknown Upload Error:", err);
        return res
          .status(500)
          .json({ error: "An unknown error occurred during upload" });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    try {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      // Console log the incoming file details for debugging.
      console.log("File received:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname },
      });

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const downloadKey = crypto
          .randomBytes(3)
          .toString("hex")
          .substring(0, 5)
          .toUpperCase();
        console.log("Generated download key:", downloadKey);

        try {
          const meta = await FileMeta.create({
            filename: uploadStream.filename,
            originalName: req.file.originalname, // Ensure originalName is explicitly passed
            size: req.file.size,
            contentType: req.file.mimetype, // Ensure contentType is explicitly passed
            gridFsId: uploadStream.id,
            uploaderIP: req.ip,
            downloadKey: downloadKey,
          });

          console.log("File metadata saved with key:", meta.downloadKey);
          console.log("File metadata saved:", meta);

          res.json({
            message: "File uploaded successfully",
            fileId: uploadStream.id,
            downloadKey: downloadKey,
            meta,
          });
        } catch (dbErr) {
          console.error("Database save error:", dbErr);
          if (!res.headersSent)
            res.status(500).json({ error: "Failed to save file metadata" });
        }
      });

      uploadStream.on("error", (err) => {
        console.error("GridFS upload error:", err);
        if (!res.headersSent) res.status(500).json({ error: "Upload failed" });
      });
    } catch (err) {
      console.error("Server error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
