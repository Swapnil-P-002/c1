/** @jsxImportSource https://esm.sh/react@18.2.0 */
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("login");
    const [rooms] = useState(["A", "B", "C"]);

    const handleLogin = async (username, password) => {
        const response = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        if (result.success) {
            setUser(result.user);
            setView("rooms");
        }
    };

    const handleRegister = async (username, password) => {
        const response = await fetch("/register", {
            method: "POST",
            body: JSON.stringify({ username, password, isAdmin: false }),
        });
        const result = await response.json();
        if (result.success) {
            setUser(result.user);
            setView("rooms");
        }
    };

    const renderContent = () => {
        switch (view) {
            case "login":
                return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
            case "rooms":
                return <RoomSelector rooms={rooms} user={user} onSelectRoom={room => setView(`room-${room}`)} />;
            default:
                if (view.startsWith("room-")) {
                    const room = view.split("-")[1];
                    return <ChatRoom room={room} user={user} />;
                }
        }
    };

    return <div className="app">{renderContent()}</div>;
}

function LoginPage({ onLogin, onRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        isRegistering ? onRegister(username, password) : onLogin(username, password);
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>{isRegistering ? "Register" : "Login"}</h2>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{isRegistering ? "Register" : "Login"}</button>
                <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Switch to Login" : "Switch to Register"}
                </button>
            </form>
        </div>
    );
}

function RoomSelector({ rooms, user, onSelectRoom }) {
    return (
        <div className="room-selector">
            <h2>Welcome, {user.username}!</h2>
            {user.isAdmin && <p>👑 Admin Access Enabled</p>}
            <h3>Select a Room:</h3>
            {rooms.map(room => (
                <button key={room} onClick={() => onSelectRoom(room)}>Division {room}</button>
            ))}
        </div>
    );
}

function ChatRoom({ room, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
    }, [room]);

    const fetchMessages = async () => {
        const response = await fetch(`/messages/${room}`);
        const roomMessages = await response.json();
        setMessages(roomMessages);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        await fetch(`/messages/${room}`, {
            method: "POST",
            body: JSON.stringify({ content: newMessage, username: user.username }),
        });
        setNewMessage("");
        fetchMessages();
    };

    return (
        <div className="chat-room">
            <h2>Division {room} Chat</h2>
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg.id} className="message">
                        <strong>{msg.username}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." required />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<App />);
