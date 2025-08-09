import cron from "node-cron";
import FileMeta from "../models/FileMeta.js";

// The cleanup function
const cleanupOldFiles = async () => {
  console.log("Running cleanup job for old files...");

  // Calculate the time 5 minutes ago
  const cutoffTime = new Date(Date.now() - 5 * 60 * 1000);

  // Find all documents older than the cutoff time
  const oldFiles = await FileMeta.find({ createdAt: { $lte: cutoffTime } });

  if (oldFiles.length === 0) {
    console.log("No old files to delete.");
    return;
  }

  console.log(`Found ${oldFiles.length} old files. Deleting...`);

  // Loop through each old file and delete it.
  // Using .deleteOne() on the document instance triggers the pre-remove hook.
  for (const file of oldFiles) {
    try {
      await file.deleteOne();
    } catch (error) {
      console.error(`Failed to delete file with ID ${file._id}:`, error);
    }
  }

  console.log("Cleanup job finished.");
};

export default cleanupOldFiles;
