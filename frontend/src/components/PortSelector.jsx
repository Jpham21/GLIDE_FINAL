import React from 'react';

const PortSelector = ({ ports, selectedPort, setSelectedPort, handleConnect, handleDisconnect, isConnected }) => {
  const handlePortChange = (e) => {
    setSelectedPort(e.target.value);
  };

  return (
    <div className="port-selector">
      <h2>Port Selector</h2>
      <div className="port-selector-controls">
        <label htmlFor="port-dropdown">Select Port:</label>
        <select
          id="port-dropdown"
          value={selectedPort}
          onChange={handlePortChange}
          disabled={isConnected} // Disable port selection when connected
        >
          <option value="">Select a port</option>
          {ports.map((port) => (
            <option key={port} value={port}>
              {port}
            </option>
          ))}
        </select>
      </div>
      <div className="port-selector-buttons">
        {!isConnected ? (
          <button onClick={handleConnect} disabled={!selectedPort}>
            Connect
          </button>
        ) : (
          <button onClick={handleDisconnect}>Disconnect</button>
        )}
      </div>
      <p className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? `Connected to ${selectedPort}` : 'Not connected'}
      </p>
    </div>
  );
};

export default PortSelector;
