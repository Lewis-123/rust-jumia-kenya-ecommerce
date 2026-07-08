import expressLayouts from "express-ejs-layouts";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import connectDatabase from "./config/database";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "../views"));

app.use(expressLayouts);

app.set("layout", "partials/layout");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.render("pages/home", {
    title: "Home | Kenya Ecommerce Store",
    description:
      "Browse affordable products available in the Kenyan market."
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    app: "running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();