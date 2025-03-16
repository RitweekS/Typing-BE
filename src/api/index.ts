import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/authRoutes/auth";
import testRoutes from "../routes/typingTestRoutes/typingTest";
import leaderboardRoutes from "../routes/leaderboardRoutes/leaderboard";
import multiplayerRoutes from "../routes/multiplayerRoutes/multiplayer";
import friendsRoutes from "../routes/friendsRoutes/friends";

dotenv.config();

const app = express();

// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
    cors({
        origin: "https://typing.ritweek.site", // Must match frontend URL exactly
        credentials: true, // Allow cookies to be sent
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization", "Set-Cookie"],
    })
);

app.use(express.json());
app.use(cookieParser());

// Example route
app.get("/", async (req, res) => {
    res.send("Running");
});

app.use("/auth", authRoutes);
app.use("/typing-tests", testRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/friends", friendsRoutes);

// For local development only
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export the Express app for Vercel
export default app;
