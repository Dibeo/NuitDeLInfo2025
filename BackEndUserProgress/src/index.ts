import express, { Request, Response } from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const port = 3000;

const db = new Database("game.db");

app.use(cors());

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

    const updateStmt = db.prepare(`
        INSERT INTO users (id, xp) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET xp = xp + excluded.xp
        `);

    updateStmt.run(userId, amount);

    const selectStmt = db.prepare("SELECT xp FROM users WHERE id = ?");
    const row = selectStmt.get(userId) as { xp: number } | undefined;

    const currentXp = row ? row.xp : 0;

    res.status(200).json({
        success: true,
        message: `XP update pour ${userId}`,
        currentXp: currentXp,
    });
});

app.get("/xp/all", (req: Request, res: Response) => {
    const allUsers = db
        .prepare("SELECT id, xp FROM users ORDER BY xp DESC")
        .all() as { id: string; xp: number }[] | undefined;
    res.status(200).json(allUsers || []);
});

app.get("/xp/:userId", (req: Request, res: Response) => {
    const userId = req.params.userId;

    const row = db.prepare("SELECT xp FROM users WHERE id = ?").get(userId) as
        | { xp: number }
        | undefined;

    const currentXp = row ? row.xp : 0;

    res.status(200).json({ userId: userId, xp: currentXp });
});

app.delete("/xp/:userId", (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
        const deleteStmt = db.prepare("DELETE FROM users WHERE id = ?");
        const info = deleteStmt.run(userId);

        if (info.changes > 0) {
            res.status(200).json({
                success: true,
                message: `L'utilisateur ${userId} a été supprimé de la base.`,
            });
        } else {
            res.status(404).json({
                success: false,
                message: `Utilisateur ${userId} introuvable.`,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});

app.listen(port, () => {
    console.log(`[BackEndUserProgress]: http://localhost:${port}`);
});
