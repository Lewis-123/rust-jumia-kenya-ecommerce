import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const databaseName = process.env.DATABASE_NAME || "kenya_shop";

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing in the .env file.");
    }

    const connection = await mongoose.connect(mongoUri, {
      dbName: databaseName,
    });

    console.log(`MongoDB connected successfully: ${connection.connection.name}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database connection error";

    console.error(`MongoDB connection failed: ${errorMessage}`);
    process.exit(1);
  }
};

export default connectDatabase;