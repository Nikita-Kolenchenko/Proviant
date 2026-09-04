import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// SETTINGS CORS
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());

// Прокидываем сокеты в каждый запрос
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ROUTS
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);

// ERRORMIDDLEWARE
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log("Server is running🟢");
  await connectDB();
});

//export default server;
