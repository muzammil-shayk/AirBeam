// A simple utility to connect to GridFS and delete a file
import mongoose from "mongoose";

export const deleteGridFSFile = async (gridFsId) => {
  if (!gridFsId) {
    console.error("No GridFS ID provided for deletion.");
    return;
  }

  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads", // This should match your GridFS bucket name
    });

    await gfs.delete(new mongoose.Types.ObjectId(gridFsId));
    console.log(`GridFS file with ID ${gridFsId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting GridFS file ${gridFsId}:`, error);
  }
};
