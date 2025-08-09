import mongoose from "mongoose";

const fileMetaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    contentType: {
      // 🚨 This is the key field
      type: String,
      required: true,
    },
    gridFsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    uploaderIP: {
      type: String,
      required: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    downloadKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const FileMeta = mongoose.model("FileMeta", fileMetaSchema);

export default FileMeta;
