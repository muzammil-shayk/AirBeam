import mongoose from "mongoose";
import { deleteGridFSFile } from "../utils/gridfs.js";

const fileMetaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
    gridFsId: { type: mongoose.Schema.Types.ObjectId, required: true },
    uploaderIP: { type: String, required: false },
    downloadCount: { type: Number, default: 0 },
    downloadKey: { type: String, required: true, unique: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🚨 UPDATED: Using `pre('deleteOne')` with `{ document: true }` is the correct hook
// for triggering document-level deletion logic with modern Mongoose versions.
fileMetaSchema.pre("deleteOne", { document: true }, async function (next) {
  console.log(
    `Pre-deleteOne hook triggered for file with key: ${this.downloadKey}`
  );
  try {
    await deleteGridFSFile(this.gridFsId);
    next();
  } catch (error) {
    console.error("Error in pre-deleteOne hook:", error);
    next(error);
  }
});

const FileMeta = mongoose.model("FileMeta", fileMetaSchema);

export default FileMeta;
