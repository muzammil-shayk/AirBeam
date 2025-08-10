import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import downloadRoutes from "./routes/download.js";
import FileMeta from "./models/FileMeta.js";
import cleanupOldFiles from "./services/cleanup.js";
import cron from "node-cron";
import path from "path";

const app = express();
dotenv.config();

const corsOptions = {
  origin: "https://airbeam.onrender.com",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    cron.schedule("*/6 * * * *", cleanupOldFiles);
    console.log("Cleanup cron job scheduled.");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("AirBeam Backend API is running!");
});

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/download", downloadRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve static files from the React build folder
  app.use(express.static(path.join(path.resolve(), "client/dist")));

  // Any request that doesn't match an API route gets sent to the React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(path.resolve(), "client/dist/index.html"));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
