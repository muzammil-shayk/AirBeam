import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import downloadRoutes from "./routes/download.js";
import FileMeta from "./models/FileMeta.js";
import cleanupOldFiles from "./services/cleanup.js";
import cron from "node-cron";

const app = express();
dotenv.config();

const corsOptions = {
  origin: ["https://airbeam.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB. Mongoose retries on its own, so a failure here is
// logged and left alone rather than taking the whole process down with it.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Scheduled outside the connect promise: if Mongo is unreachable at boot, the
// keep-alive ping below still has to run or Render puts the instance to sleep.
cron.schedule("*/6 * * * *", async () => {
  try {
    await cleanupOldFiles();
  } catch (err) {
    console.error("Cleanup job failed:", err);
  }
  // Render free tier sleeps after 15 min without inbound HTTP traffic.
  // Hitting our own public URL counts as inbound and keeps the instance awake.
  if (process.env.RENDER_EXTERNAL_URL) {
    fetch(process.env.RENDER_EXTERNAL_URL).catch(() => {});
  }
});
console.log("Cleanup cron job scheduled.");

app.get("/", (req, res) => {
  res.send("AirBeam Backend API is running!");
});

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/download", downloadRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
