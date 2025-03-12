import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "cookie";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: { id: string } & jwt.JwtPayload; // Ensure user has an id
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response | any,
    next: NextFunction
) => {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies["next-auth-session"];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    try {
        const decoded = jwt.verify(token, "mysecret") as jwt.JwtPayload;

        if (!decoded.userId) {
            return res.status(403).json({ error: "Invalid token payload" });
        }

        req.user = { id: decoded.userId, ...decoded };
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};
