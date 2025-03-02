import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authMiddleware } from "../../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
    const { wpm, accuracy, testDuration, difficulty } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        res.status(500).json({ error: "Failed to save test" });
        return;
    }

    try {
        const test = await prisma.typingTest.create({
            data: { userId, wpm, accuracy, testDuration, difficulty },
        });
        res.json(test);
    } catch (error) {
        res.status(500).json({ error: "Failed to save test" });
    }
});

router.get("/user", authMiddleware, async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(500).json({ error: "Failed to save test" });
        return;
    }

    try {
        const tests = await prisma.typingTest.findMany({ where: { userId } });
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tests" });
    }
});

export default router;
