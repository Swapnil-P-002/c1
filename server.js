import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";

const SCHEMA_VERSION = 5;
const KEY = "chat_db";

await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_users_${SCHEMA_VERSION} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0
    )
`);

await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_messages_${SCHEMA_VERSION} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

export default async function server(request) {
    const url = new URL(request.url);

    if (url.pathname === "/login" && request.method === "POST") {
        const { username, password } = await request.json();
        const result = await sqlite.execute(`SELECT username, is_admin FROM ${KEY}_users_${SCHEMA_VERSION} WHERE username = ? AND password = ?`, [username, password]);
        return new Response(JSON.stringify({ success: result.rows.length > 0, user: result.rows[0] }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname.startsWith("/messages/") && request.method === "GET") {
        const room = url.pathname.split("/").pop();
        const result = await sqlite.execute(`SELECT * FROM ${KEY}_messages_${SCHEMA_VERSION} WHERE room = ? ORDER BY timestamp`, [room]);
        return new Response(JSON.stringify(result.rows), { headers: { "Content-Type": "application/json" } });
    }
}
