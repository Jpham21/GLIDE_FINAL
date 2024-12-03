import React, { useState } from "react";

const CommandSender = () => {
    const [command, setCommand] = useState("");
    const [error, setError] = useState(null);

    const sendCommand = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/write", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });
            if (!response.ok) throw new Error("Failed to send command");
            alert(`Command sent: ${command}`);
        } catch (error) {
            console.error("Error sending command:", error.message);
            setError("Unable to send command.");
        }
    };

    return (
        <div>
            <h3>Send Command to Arduino</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command (e.g., HIGH, LOW)"
            />
            <button onClick={sendCommand}>Send Command</button>
        </div>
    );
};

export default CommandSender;
