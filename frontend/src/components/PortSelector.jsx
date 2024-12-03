import React, { useState, useEffect } from "react";

const PortSelector = ({ onPortSelect }) => {
    const [ports, setPorts] = useState([]);
    const [selectedPort, setSelectedPort] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPorts();
    }, []);

    const fetchPorts = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/ports");
            if (!response.ok) throw new Error("Failed to fetch ports");
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error("Error fetching ports:", error.message);
            setError("Unable to fetch ports. Ensure the backend is running.");
        }
    };

    const handlePortChange = (event) => {
        const port = event.target.value;
        setSelectedPort(port);
        onPortSelect(port);
    };

    return (
        <div>
            <h3>Select a Port</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <select value={selectedPort} onChange={handlePortChange}>
                <option value="" disabled>Select a port</option>
                {ports.map((port, index) => (
                    <option key={index} value={port.device}>
                        {port.description || port.device}
                    </option>
                ))}
            </select>
            <button onClick={fetchPorts}>Refresh Ports</button>
        </div>
    );
};

export default PortSelector;
