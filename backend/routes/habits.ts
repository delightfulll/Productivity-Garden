import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

type HabitEntryStatus = "success" | "failed";

function isIsoDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeStatus(value: unknown): HabitEntryStatus | null | undefined {
  if (value === null || value === "" || value === "none") return null;
  if (value === "success" || value === "failed") return value;
  return undefined;
}

// GET /api/habits?userId=1&startDate=2026-04-19&endDate=2026-04-25
router.get("/", async (req: Request, res: Response) => {
  const { userId, startDate, endDate } = req.query;
  if (!userId) {
    res.status(400).json({ error: "userId query param is required" });
    return;
  }

  try {
    const habitsResult = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at ASC, id ASC",
      [Number(userId)],
    );

    const habitIds = habitsResult.rows.map((habit) => habit.id as number);
    if (habitIds.length === 0) {
      res.json([]);
      return;
    }

    const params: unknown[] = [habitIds];
    let entriesQuery = "SELECT * FROM habit_entries WHERE habit_id = ANY($1::int[])";

    if (isIsoDay(startDate) && isIsoDay(endDate)) {
      params.push(startDate, endDate);
      entriesQuery += " AND entry_date BETWEEN $2 AND $3";
    }

    entriesQuery += " ORDER BY entry_date ASC";
    const entriesResult = await pool.query(entriesQuery, params);
    const entriesByHabit = new Map<number, unknown[]>();

    for (const entry of entriesResult.rows) {
      const habitId = entry.habit_id as number;
      entriesByHabit.set(habitId, [...(entriesByHabit.get(habitId) ?? []), entry]);
    }

    res.json(
      habitsResult.rows.map((habit) => ({
        ...habit,
        entries: entriesByHabit.get(habit.id) ?? [],
      })),
    );
  } catch (err) {
    console.error("GET /habits error:", err);
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

// POST /api/habits
// Body: { user_id, name }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, name } = req.body;
  const trimmedName = typeof name === "string" ? name.trim() : "";

  if (!user_id || !trimmedName) {
    res.status(400).json({ error: "user_id and name are required" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO habits (user_id, name) VALUES ($1, $2) RETURNING *",
      [user_id, trimmedName],
    );
    res.status(201).json({ ...result.rows[0], entries: [] });
  } catch (err) {
    console.error("POST /habits error:", err);
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// PUT /api/habits/:id/entries
// Body: { entry_date, status } where status is success, failed, or null to clear
router.put("/:id/entries", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { entry_date } = req.body;
  const status = normalizeStatus(req.body.status);
  const habitId = Number(id);

  if (!habitId || Number.isNaN(habitId)) {
    res.status(400).json({ error: "Invalid habit id" });
    return;
  }
  if (!isIsoDay(entry_date) || status === undefined) {
    res.status(400).json({ error: "entry_date and valid status are required" });
    return;
  }

  try {
    const habitResult = await pool.query("SELECT id FROM habits WHERE id = $1", [
      habitId,
    ]);
    if (habitResult.rowCount === 0) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }

    if (status === null) {
      await pool.query(
        "DELETE FROM habit_entries WHERE habit_id = $1 AND entry_date = $2",
        [habitId, entry_date],
      );
      res.json({ habit_id: habitId, entry_date, status: null });
      return;
    }

    const result = await pool.query(
      `INSERT INTO habit_entries (habit_id, entry_date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, entry_date)
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`,
      [habitId, entry_date, status],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /habits/:id/entries error:", err);
    res.status(500).json({ error: "Failed to save habit entry" });
  }
});

// DELETE /api/habits/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM habits WHERE id = $1 RETURNING *",
      [Number(id)],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }
    res.json({ message: "Habit deleted", habit: result.rows[0] });
  } catch (err) {
    console.error("DELETE /habits/:id error:", err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
