import React, { useState } from 'react';
import axios from 'axios';
const { saveFileDialog } = window.electron;


const BASE_URL = 'http://localhost:8000';

const PinControl = () => {
  const [pin, setPin] = useState('');
  const [pinState, setPinState] = useState('HIGH');
  const [runtime, setRuntime] = useState('');

  const handlePinChange = (e) => setPin(e.target.value);
  const handlePinStateChange = (e) => setPinState(e.target.value);
  const handleRuntimeChange = (e) => setRuntime(e.target.value);

  const handleRunExperiment = async () => {
    if (pin === '') {
      alert('Please select a pin number.');
      return;
    }
  
    if (!runtime || runtime <= 0) {
      alert('Please specify a valid runtime duration.');
      return;
    }
  
    // Open the save dialog using the exposed API
    const filePath = await saveFileDialog();
  
    if (!filePath) {
      alert('You must select a file path to save the video.');
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/run-experiment`, {
        pin: parseInt(pin, 10),
        state: pinState === 'HIGH' ? 1 : 0,
        runtime: parseInt(runtime, 10),
        file_path: filePath, // Send the selected file path to the backend
      });
  
      if (response.status === 200) {
        alert(`Experiment and recording started successfully! Video saved as: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error running experiment:', error);
      alert('Failed to run experiment and start recording.');
    }
  };
  

  return (
    <div>
      <h2>Pin Control</h2>
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
      <div>
        <label>Runtime (seconds):</label>
        <input type="number" value={runtime} onChange={handleRuntimeChange} placeholder="Runtime in seconds" />
      </div>
      <button onClick={handleRunExperiment}>Run Experiment</button>
    </div>
  );
};

export default PinControl;
