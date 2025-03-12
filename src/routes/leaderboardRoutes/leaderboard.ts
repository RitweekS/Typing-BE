import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authMiddleware } from "../../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (_req, res) => {
    try {
        const allStats = await prisma.typingTest.findMany();
        const users = await prisma.user.findMany();
        // Group all tests by userId.
        // Calculate average WPM and accuracy for each user.
        // Calculate the total number of tests for each user.
        // Use the weighted formula to compute a score.
        // Sort the results in descending order of the score.

        const usersStats = allStats.reduce<
            Record<
                string,
                { wpmSum: number; accuracySum: number; totalTest: number }
            >
        >((acc, current) => {
            if (!acc[current.userId]) {
                acc[current.userId] = {
                    wpmSum: 0,
                    accuracySum: 0,
                    totalTest: 0,
                };
            }
            acc[current.userId].wpmSum += current.wpm;
            acc[current.userId].accuracySum += current.accuracy;
            acc[current.userId].totalTest += 1;
            return acc;
        }, {});

        const leaderboard = Object.entries(usersStats).map(
            ([userId, stats]) => {
                const avgWPM = stats.wpmSum / stats.totalTest;
                const avgAccuracy = stats.accuracySum / stats.totalTest;
                const score =
                    avgWPM * 0.6 + avgAccuracy * 0.3 + stats.totalTest * 0.1;
                const userDetails = { ...users.find((u) => u.id === userId) };
                return {
                    user: {
                        name: userDetails.name,
                        email: userDetails.email,
                        avatarUrl: userDetails.avatarUrl,
                    },
                    score: score.toFixed(2),
                };
            }
        );

        console.log("usersAvgStats", leaderboard);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// router.post(
//     "/update",
//     authMiddleware,
//     async (req: AuthenticatedRequest, res) => {
//         const { wpm, accuracy } = req.body;
//         const userId = req.user?.id;
//         if (!userId) {
//             res.status(500).json({ error: "Failed to save test" });
//             return;
//         }

//         try {
//             const existing = await prisma.leaderboard.findUnique({
//                 where: { userId },
//             });

//             if (!existing) {
//                 await prisma.leaderboard.create({
//                     data: { userId, bestWPM: wpm, bestAccuracy: accuracy },
//                 });
//             } else {
//                 await prisma.leaderboard.update({
//                     where: { userId },
//                     data: {
//                         bestWPM: Math.max(existing.bestWPM, wpm),
//                         bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
//                     },
//                 });
//             }
//             res.json({ message: "Leaderboard updated" });
//         } catch (error) {
//             res.status(500).json({ error: "Failed to update leaderboard" });
//         }
//     }
// );

export default router;
