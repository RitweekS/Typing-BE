import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Send friend request
router.post(
    "/request",
    authMiddleware,
    async (req: AuthenticatedRequest, res) => {
        const { friendId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(500).json({ error: "Failed to save test" });
            return;
        }
        try {
            const existing = await prisma.friendship.findFirst({
                where: { userId, friendId },
            });

            if (existing) {
                res.status(400).json({ error: "Friend request already sent" });
                return;
            }

            const request = await prisma.friendship.create({
                data: { userId, friendId },
            });
            res.json(request);
        } catch (error) {
            res.status(500).json({ error: "Failed to send request" });
        }
    }
);

// Accept friend request
router.post(
    "/accept",
    authMiddleware,
    async (req: AuthenticatedRequest, res) => {
        const { friendId } = req.body;

        const userId = req.user?.id;

        if (!userId) {
            res.status(500).json({ error: "Failed to save test" });
            return;
        }

        try {
            await prisma.friendship.updateMany({
                where: {
                    userId: friendId,
                    friendId: userId,
                    status: "PENDING",
                },
                data: { status: "ACCEPTED" },
            });
            res.json({ message: "Friend request accepted" });
        } catch (error) {
            res.status(500).json({ error: "Failed to accept request" });
        }
    }
);

// // List friends
// router.get("/", authMiddleware, async (req, res) => {
//     const { userId } = req.query;
//     try {
//         const friends = await prisma.friendship.findMany({
//             where: {
//                 OR: [{ userId }, { friendId: userId }],
//                 status: "ACCEPTED",
//             },
//             include: { user: true, friend: true },
//         });
//         res.json(friends);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch friends" });
//     }
// });

export default router;
