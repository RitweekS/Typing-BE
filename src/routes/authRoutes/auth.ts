import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

router.post("/verify", async (req, res) => {
    const { email, name, avatarUrl, provider } = req.body;
    try {
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, name, avatarUrl, provider },
            });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: "Authentication failed" });
    }
});

export default router;
