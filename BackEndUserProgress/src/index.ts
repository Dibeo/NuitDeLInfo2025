import express, { Request, Response } from "express";
import Database from "better-sqlite3";

const app = express();
const port = 3000;

const db = new Database("game.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, 
        xp INTEGER DEFAULT 0
    )
`);

app.use(express.json());

app.post("/xp", (req: Request, res: Response) => {
    const amount: number = parseInt(req.body.amount);
    const userId: string = req.body.userId;

    if (!userId || isNaN(amount)) {
        res.status(400).json({ error: "Il faut un userId et un amount" });
        return;
    }

    const stmt = db.prepare(`
        INSERT INTO users (id, xp) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET xp = xp + excluded.xp
    `);

    stmt.run(userId, amount);

    res.status(200).json({
        success: true,
        message: `XP update pour ${userId}`,
    });
});

app.get("/xp/:userId", (req: Request, res: Response) => {
    const userId = req.params.userId;

    const row = db.prepare("SELECT xp FROM users WHERE id = ?").get(userId) as
        | { xp: number }
        | undefined;

    const currentXp = row ? row.xp : 0;

    res.status(200).json({ userId: userId, xp: currentXp });
});

app.listen(port, () => {
    console.log(`[BackEndUserProgress]: http://localhost:${port}`);
});
