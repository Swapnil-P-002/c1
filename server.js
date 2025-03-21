import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(express.json());
app.use(cors());

const dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = await dbPromise;
  const user = await db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const db = await dbPromise;

  try {
    await db.run("INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)", [username, password, 0]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false });
  }
});

app.get("/messages/:room", async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all("SELECT * FROM messages WHERE room = ?", [req.params.room]);
  res.json(messages);
});

app.post("/messages/:room", async (req, res) => {
  const { content, username } = req.body;
  const db = await dbPromise;

  await db.run("INSERT INTO messages (room, username, content) VALUES (?, ?, ?)", [req.params.room, username, content]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
