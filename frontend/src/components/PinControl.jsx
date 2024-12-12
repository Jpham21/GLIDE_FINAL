import React, { useState } from "react";
import axios from "axios";
const { saveFileDialog } = window.electron;

const BASE_URL = "http://localhost:8000";

const PinControl = () => {
  const [configuration, setConfiguration] = useState("normal"); // "normal" or "beam"
  const [pin, setPin] = useState("");
  const [pinState, setPinState] = useState("HIGH");
  const [runtime, setRuntime] = useState("");
  const [beamPin, setBeamPin] = useState("");
  const [ledPin, setLedPin] = useState("");

  const handleConfigurationChange = (e) => setConfiguration(e.target.value);
  const handlePinChange = (e) => setPin(e.target.value);
  const handlePinStateChange = (e) => setPinState(e.target.value);
  const handleRuntimeChange = (e) => setRuntime(e.target.value);
  const handleBeamPinChange = (e) => setBeamPin(e.target.value);
  const handleLedPinChange = (e) => setLedPin(e.target.value);

  const handleRunExperiment = async () => {
    if (!runtime || runtime <= 0) {
      alert("Please specify a valid runtime duration.");
      return;
    }

    if (configuration === "normal") {
      if (pin === "") {
        alert("Please select a pin number.");
        return;
      }

      const filePath = await saveFileDialog();
      if (!filePath) {
        alert("You must select a file path to save the video.");
        return;
      }

      try {
        const response = await axios.post(`${BASE_URL}/run-experiment`, {
          pin: parseInt(pin, 10),
          state: pinState === "HIGH" ? 1 : 0,
          runtime: parseInt(runtime, 10),
          file_path: filePath,
        });
        alert(`Experiment and recording started successfully! Video saved as: ${response.data.message}`);
      } catch (error) {
        console.error("Error running experiment:", error);
        alert("Failed to run experiment and start recording.");
      }
    } else if (configuration === "beam") {
      if (!beamPin || !ledPin) {
        alert("Please specify both the beam break sensor pin and the LED pin.");
        return;
      }

      const filePath = await saveFileDialog();
      if (!filePath) {
        alert("You must select a file path to save the video.");
        return;
      }

      try {
        const response = await axios.post(`${BASE_URL}/run-beam-experiment`, {
          beam_pin: parseInt(beamPin, 10),
          led_pin: parseInt(ledPin, 10),
          runtime: parseInt(runtime, 10), // Runtime in seconds
          file_path: filePath,
        });
        alert(response.data.message);
      } catch (error) {
        console.error("Error starting beam experiment:", error);
        alert("Failed to start beam experiment.");
      }
    }
  };

  return (
    <div>
      <h2>Pin Control</h2>
      <div>
        <label>Select Configuration:</label>
        <select value={configuration} onChange={handleConfigurationChange}>
          <option value="normal">Normal Pin Control</option>
          <option value="beam">Beam Break Sensor & LED Control</option>
        </select>
      </div>

      {configuration === "normal" && (
        <div>
          <h3>Normal Pin Control</h3>
          <div>
            <label>Pin Number:</label>
            <input type="number" value={pin} onChange={handlePinChange} placeholder="0-13" min="0" max="13" />
          </div>
          <div>
            <label>Pin State:</label>
            <select value={pinState} onChange={handlePinStateChange}>
              <option value="HIGH">HIGH</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      )}

      {configuration === "beam" && (
        <div>
          <h3>Beam Break Sensor & LED Control</h3>
          <div>
            <label>Beam Break Sensor Pin:</label>
            <input type="number" value={beamPin} onChange={handleBeamPinChange} placeholder="0-13" min="0" max="13" />
          </div>
          <div>
            <label>LED Pin:</label>
            <input type="number" value={ledPin} onChange={handleLedPinChange} placeholder="0-13" min="0" max="13" />
          </div>
        </div>
      )}

      <div>
        <label>Runtime (seconds):</label>
        <input type="number" value={runtime} onChange={handleRuntimeChange} placeholder="Runtime in seconds" />
      </div>

      <button onClick={handleRunExperiment}>Start Experiment</button>
    </div>
  );
};

export default PinControl;
