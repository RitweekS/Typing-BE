import express, { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

const prisma = new PrismaClient();

export default function multiplayerRoutes(io: Server): Router {
    const router = express.Router();
    const rooms = new Map<string, string[]>(); // Store active rooms

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", ({ userId, roomId }) => {
            socket.join(roomId);

            if (!rooms.has(roomId)) rooms.set(roomId, []);
            rooms.get(roomId)?.push(userId);

            io.to(roomId).emit("update-players", rooms.get(roomId));
        });

        socket.on("typing-progress", ({ roomId, userId, wpm, accuracy }) => {
            io.to(roomId).emit("update-progress", { userId, wpm, accuracy });
        });

        socket.on("leave-room", ({ userId, roomId }) => {
            socket.leave(roomId);
            const roomUsers =
                rooms.get(roomId)?.filter((id) => id !== userId) || [];
            rooms.set(roomId, roomUsers);
            io.to(roomId).emit("update-players", roomUsers);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    router.post("/create", async (req, res) => {
        const { userId } = req.body;
        try {
            const session = await prisma.multiplayerSession.create({
                data: { hostId: userId, startTime: new Date() },
            });
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: "Failed to create session" });
        }
    });

    router.get("/:roomId", async (req, res) => {
        const { roomId } = req.params;
        try {
            const session = await prisma.multiplayerSession.findUnique({
                where: { id: roomId },
            });
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch session" });
        }
    });

    return router;
}
