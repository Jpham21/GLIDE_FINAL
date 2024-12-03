import React, { useState } from "react";

const PinControl = () => {
    const [pin, setPin] = useState("");
    const [mode, setMode] = useState("");
    const [state, setState] = useState("");
    const [readValue, setReadValue] = useState(null);
    const [error, setError] = useState(null);

    const configurePin = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/configure_pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: parseInt(pin), mode: "OUTPUT" }), // Ensure mode is OUTPUT
            });
            if (!response.ok) throw new Error("Failed to configure pin");
            alert(`Pin ${pin} configured as OUTPUT`);
        } catch (error) {
            console.error("Error configuring pin:", error.message);
            setError("Unable to configure pin.");
        }
    };
    
    
    const setPinState = async () => {
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/arduino/set_pin_state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: parseInt(pin), state }), // Ensure pin is an integer
            });
            if (!response.ok) throw new Error("Failed to set pin state");
            alert(`Pin ${pin} set to ${state}`);
        } catch (error) {
            console.error("Error setting pin state:", error.message);
            setError("Unable to set pin state.");
        }
    };

    const readPinState = async () => {
        setError(null);
        try {
            const response = await fetch(`http://127.0.0.1:8000/arduino/read_pin_state?pin=${parseInt(pin)}`);
            if (!response.ok) throw new Error("Failed to read pin state");
            const data = await response.json();
            setReadValue(data.state);
        } catch (error) {
            console.error("Error reading pin state:", error.message);
            setError("Unable to read pin state.");
        }
    };

    return (
        <div>
            <h3>Pin Control</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="number"
                placeholder="Pin number"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
            />
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="" disabled>
                    Select Mode
                </option>
                <option value="INPUT">INPUT</option>
                <option value="OUTPUT">OUTPUT</option>
                <option value="PWM">PWM</option>
            </select>
            <button onClick={configurePin}>Configure Pin</button>
            <input
                type="text"
                placeholder="HIGH or LOW"
                value={state}
                onChange={(e) => setState(e.target.value)}
            />
            <button onClick={setPinState}>Set Pin State</button>
            <button onClick={readPinState}>Read Pin State</button>
            {readValue !== null && <p>Pin {pin} State: {readValue}</p>}
        </div>
    );
};

export default PinControl;
