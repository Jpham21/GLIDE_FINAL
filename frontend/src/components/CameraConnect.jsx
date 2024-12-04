import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const CameraConnect = () => {
  const [isCameraConnected, setIsCameraConnected] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAvailableCameras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/list-cameras`);
      setAvailableCameras(response.data.cameras);
    } catch (error) {
      console.error('Error fetching available cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCameraStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/camera-status`);
      setIsCameraConnected(response.data.connected);
    } catch (error) {
      console.error('Error checking camera status:', error);
    }
  };

  const handleConnectCamera = async () => {
    if (!selectedCamera) {
      alert('Please select a camera.');
      return;
    }

    try {
      setLoading(true);
      const cameraIndex = parseInt(selectedCamera.split(' ')[1]); // Extract index from "Camera X"
      const response = await axios.post(`${BASE_URL}/connect-camera`, {
        camera_index: cameraIndex,
      });
      if (response.status === 200) {
        setIsCameraConnected(true);
        alert(`Connected to ${selectedCamera}`);
      }
    } catch (error) {
      console.error('Error connecting camera:', error);
      alert('Failed to connect to the camera.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCameras();
    checkCameraStatus();
  }, []);

  return (
    <div className="camera-connect">
      <h2>Camera Connection</h2>
      <p className={`status ${isCameraConnected ? 'connected' : 'disconnected'}`}>
        {isCameraConnected ? "Camera is connected." : "Camera is not connected."}
      </p>
      <div className="camera-selector">
        <label>Select Camera: </label>
        <select
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          disabled={loading || isCameraConnected}
        >
          <option value="">-- Select a Camera --</option>
          {availableCameras.map((camera, index) => (
            <option key={index} value={camera}>
              {camera}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleConnectCamera} disabled={!selectedCamera || loading || isCameraConnected}>
        {loading ? 'Connecting...' : 'Connect Camera'}
      </button>
    </div>
  );
};

export default CameraConnect;

