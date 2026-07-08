import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import MongoStore from "connect-mongo";
import { flashMiddleware } from "./middleware/flashMiddleware";
import connectDatabase from "./config/database";
import publicRoutes from "./routes/publicRoutes";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME || "kenya_shop";
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing in .env file.");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is missing in .env file.");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(expressLayouts);
app.set("layout", "partials/layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      dbName: databaseName,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use((req: Request, res: Response, next) => {
  res.locals.currentAdmin = req.session.adminId
    ? {
        id: req.session.adminId,
        name: req.session.adminName,
      }
    : null;

  next();
});

app.use(flashMiddleware);

app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

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