import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import FileMeta from "../models/FileMeta.js";
import crypto from "crypto";
import { fixFilenames, shouldZip, zipFilesTo } from "../utils/zip.js";

const router = express.Router();
const storage = multer.memoryStorage();

// Configure multer with file size limits
const MAX_BYTES = 200 * 1024 * 1024; // 200MB total
const MAX_FILES = 1000;

// No fileFilter: every file type is accepted. preservePath keeps the relative
// path of files picked from a folder ("photos/a.jpg") instead of just "a.jpg".
const upload = multer({
  storage,
  preservePath: true,
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
});

router.post(
  "/",
  (req, res, next) => {
    upload.array("files", MAX_FILES)(req, res, (err) => {
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
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files provided" });
    fixFilenames(req.files);

    // Verify collective size <= 200MB
    const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_BYTES) {
      return res.status(400).json({ error: "Total combined file size exceeds 200MB limit." });
    }

    try {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: "uploads" });

      // Generate a single 8-character uppercase alphanumeric key for all files
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let downloadKey = "";
      for (let i = 0; i < 8; i++) {
        downloadKey += chars[crypto.randomInt(0, chars.length)];
      }

      console.log(`Generated download key: ${downloadKey} for ${req.files.length} files`);

      const saveMeta = (uploadStream, originalName, size, contentType) =>
        FileMeta.create({
          filename: uploadStream.filename,
          originalName,
          size,
          contentType,
          gridFsId: uploadStream.id,
          uploaderIP: req.ip,
          downloadKey: downloadKey,
        });

      const zipped = shouldZip(req.files);

      // Several files or a folder: one zip stored under the one key.
      // A single plain file is stored as-is.
      const uploadPromises = zipped
        ? [
            (async () => {
              const name = `AirBeam-${downloadKey}.zip`;
              const uploadStream = bucket.openUploadStream(name, {
                contentType: "application/zip",
                metadata: { originalName: name },
              });
              const size = await zipFilesTo(req.files, uploadStream);
              return saveMeta(uploadStream, name, size, "application/zip");
            })(),
          ]
        : req.files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = bucket.openUploadStream(file.originalname, {
                contentType: file.mimetype,
                metadata: { originalName: file.originalname },
              });

              uploadStream.end(file.buffer);

              uploadStream.on("finish", async () => {
                try {
                  resolve(
                    await saveMeta(
                      uploadStream,
                      file.originalname,
                      file.size,
                      file.mimetype || "application/octet-stream"
                    )
                  );
                } catch (dbErr) {
                  console.error("Database save error:", dbErr);
                  reject(dbErr);
                }
              });

              uploadStream.on("error", (err) => {
                console.error("GridFS upload error:", err);
                reject(err);
              });
            });
          });

      // Await all uploads to finish
      const savedMetas = await Promise.all(uploadPromises);
      console.log(`Successfully saved metadata for ${savedMetas.length} files with key ${downloadKey}.`);

      res.json({
        message: "Files uploaded successfully",
        downloadKey: downloadKey,
        filesCount: req.files.length,
        zipped,
        metas: savedMetas,
      });

    } catch (err) {
      console.error("Server error during upload processing:", err);
      if (!res.headersSent) res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
