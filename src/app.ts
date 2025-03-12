import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";
import authRoutes from "./routes/authRoutes/auth";
import testRoutes from "./routes/typingTestRoutes/typingTest";
import leaderboardRoutes from "./routes/leaderboardRoutes/leaderboard";
import multiplayerRoutes from "./routes/multiplayerRoutes/multiplayer";
import friendsRoutes from "./routes/friendsRoutes/friends";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Example route
app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.use("/auth", authRoutes);
app.use("/typing-tests", testRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/multiplayer", multiplayerRoutes(io)); // Pass `io` to multiplayer
app.use("/friends", friendsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
