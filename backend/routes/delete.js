// delete.js
import express from "express";
import mongoose from "mongoose";
import FileMeta from "../models/FileMeta.js";

const router = express.Router();

// The global CORS middleware in server.js now handles all headers.
// Removing this section prevents potential conflicts.
// router.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header("Access-Control-Allow-Methods", "DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });

    const meta = await FileMeta.findById(id);
    if (!meta) return res.status(404).json({ error: "File not found" });

    // Delete file from GridFS
    await bucket.delete(meta.gridFsId);

    // Delete metadata
    await FileMeta.deleteOne({ _id: id });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
