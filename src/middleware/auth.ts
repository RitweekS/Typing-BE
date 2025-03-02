import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: { id: string } & jwt.JwtPayload; // Ensure user has an id
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response | any,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as jwt.JwtPayload;

        if (!decoded.userId) {
            return res.status(403).json({ error: "Invalid token payload" });
        }

        req.user = { id: decoded.userId, ...decoded };
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};
