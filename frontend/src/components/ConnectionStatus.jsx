import React, { useState, useEffect } from "react";

const ConnectionStatus = ({ selectedPort }) => {
    const [status, setStatus] = useState("Disconnected");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/status");
            if (!response.ok) throw new Error("Failed to fetch status");
            const data = await response.json();
            setStatus(data.connected ? "Connected" : "Disconnected");
        } catch (error) {
            console.error("Error fetching connection status:", error.message);
            setError("Unable to fetch connection status.");
        }
    };

    const handleConnect = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ port: selectedPort }), // Correctly formatted JSON
            });
            if (!response.ok) throw new Error("Failed to connect to Arduino");
            alert(`Connected to Arduino on ${selectedPort}`);
            fetchStatus(); // Update connection status
        } catch (error) {
            console.error("Error connecting to Arduino:", error.message);
            setError("Unable to connect to Arduino.");
        }
    };    

    const handleDisconnect = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/disconnect", {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to disconnect Arduino");
            alert("Disconnected from Arduino");
            fetchStatus();
        } catch (error) {
            console.error("Error disconnecting from Arduino:", error.message);
            setError("Unable to disconnect from Arduino.");
        }
    };

    return (
        <div>
            <h3>Connection Status: {status}</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {selectedPort && (
                <>
                    <button onClick={handleConnect} disabled={status === "Connected"}>
                        Connect
                    </button>
                    <button onClick={handleDisconnect} disabled={status === "Disconnected"}>
                        Disconnect
                    </button>
                </>
            )}
        </div>
    );
};

export default ConnectionStatus;
