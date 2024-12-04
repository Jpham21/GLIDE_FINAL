import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PortSelector from './components/PortSelector';
import PinControl from './components/PinControl';
import CameraConnect from './components/CameraConnect';

const BASE_URL = 'http://localhost:8000';

const App = () => {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/ports`);
        setPorts(response.data.ports);
      } catch (error) {
        console.error('Error fetching ports:', error);
      }
    };
    fetchPorts();
  }, []);

  const handleConnect = async () => {
    if (!selectedPort) {
      alert('Please select a port.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/connect`, { port: selectedPort });
      if (response.status === 200) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      alert('Failed to connect to Arduino.');
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/disconnect`);
      if (response.status === 200) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting from Arduino:', error);
      alert('Failed to disconnect from Arduino.');
    }
  };

  const handleSendCommand = async (command) => {
    try {
      const response = await axios.post(`${BASE_URL}/send-command`, { command });
      if (response.status === 200) {
        console.log('Command sent successfully');
      }
    } catch (error) {
      console.error('Error sending command to Arduino:', error);
      alert('Failed to send command to Arduino.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Arduino Control Panel</h1>
      </header>
      <main className="app-content">
        {/* Connection Section */}
        <section className="connection-section sleek-card">
          <h2>Connection Status</h2>
          <PortSelector
            ports={ports}
            selectedPort={selectedPort}
            setSelectedPort={setSelectedPort}
            handleConnect={handleConnect}
            handleDisconnect={handleDisconnect}
            isConnected={isConnected}
          />
        </section>

        {/* Camera Section */}
        <section className="camera-section sleek-card">
          <h2>Camera Control</h2>
          <CameraConnect />
        </section>

        {/* Pin Control Section */}
        {isConnected && (
          <section className="pin-control-section sleek-card">
            <h2>Pin Control</h2>
            <PinControl handleSendCommand={handleSendCommand} />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
