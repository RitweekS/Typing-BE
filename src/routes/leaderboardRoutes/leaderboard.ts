import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authMiddleware } from "../../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (_req, res) => {
    try {
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: [{ bestWPM: "desc" }, { bestAccuracy: "desc" }],
            take: 10,
            include: { user: true },
        });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

router.post(
    "/update",
    authMiddleware,
    async (req: AuthenticatedRequest, res) => {
        const { wpm, accuracy } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(500).json({ error: "Failed to save test" });
            return;
        }

        try {
            const existing = await prisma.leaderboard.findUnique({
                where: { userId },
            });

            if (!existing) {
                await prisma.leaderboard.create({
                    data: { userId, bestWPM: wpm, bestAccuracy: accuracy },
                });
            } else {
                await prisma.leaderboard.update({
                    where: { userId },
                    data: {
                        bestWPM: Math.max(existing.bestWPM, wpm),
                        bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
                    },
                });
            }
            res.json({ message: "Leaderboard updated" });
        } catch (error) {
            res.status(500).json({ error: "Failed to update leaderboard" });
        }
    }
);

export default router;
