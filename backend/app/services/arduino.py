import serial
from serial.tools import list_ports
import cv2
import os
import threading
import time
from datetime import datetime

arduino_connection = None
camera = None
video_writer = None

# Function to list available ports
def list_available_ports():
    ports = list_ports.comports()
    return [port.device for port in ports]

# Function to connect to Arduino
def connect_arduino(port: str):
    global arduino_connection
    try:
        arduino_connection = serial.Serial(port=port, baudrate=9600, timeout=1)
        return {"message": "Connected successfully"}
    except serial.SerialException as e:
        return {"error": f"Error connecting to Arduino: {e}"}

# Function to disconnect Arduino
def disconnect_arduino():
    global arduino_connection
    try:
        if arduino_connection and arduino_connection.is_open:
            arduino_connection.close()
            arduino_connection = None
            return {"message": "Disconnected successfully"}
        return {"error": "No active connection"}
    except Exception as e:
        return {"error": f"Error disconnecting from Arduino: {e}"}

# Function to send a command to Arduino
def send_command(command: str):
    global arduino_connection
    try:
        if arduino_connection and arduino_connection.is_open:
            arduino_connection.write(f"{command}\n".encode())
            return {"message": "Command sent successfully"}
        return {"error": "Arduino is not connected"}
    except Exception as e:
        return {"error": f"Error sending command: {e}"}

def list_cameras():
    available_cameras = []
    for i in range(10):  # Check indices 0-9 for cameras
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available_cameras.append(f"Camera {i}")
            cap.release()
    return available_cameras

def connect_camera(camera_index: int):
    global camera
    if camera is not None and camera.isOpened():
        return {"message": "Camera is already connected."}

    camera = cv2.VideoCapture(camera_index)
    if not camera.isOpened():
        return {"error": f"Unable to access camera {camera_index}."}
    return {"message": f"Camera {camera_index} connected successfully."}

def camera_status():
    global camera
    return camera is not None and camera.isOpened()


# Function to run an experiment with recording
def run_experiment_with_recording(pin, state, runtime, file_path):
    global arduino_connection, camera, video_writer

    if arduino_connection is None or not arduino_connection.is_open:
        return {"error": "Arduino is not connected."}

    if camera is None or not camera.isOpened():
        return {"error": "Camera is not connected."}

    if not file_path:
        return {"error": "Invalid file path provided."}

    # Set up video writer
    fourcc = cv2.VideoWriter_fourcc(*'m', 'p', '4', 'v')  # MP4 codec
    fps = int(camera.get(cv2.CAP_PROP_FPS)) or 30  # Default to 30 FPS
    frame_width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_writer = cv2.VideoWriter(file_path, fourcc, fps, (frame_width, frame_height))

    # Start video recording in a separate thread
    def record_video():
        start_time = time.time()
        while time.time() - start_time < runtime:
            ret, frame = camera.read()
            if ret:
                video_writer.write(frame)
        video_writer.release()

    video_thread = threading.Thread(target=record_video)
    video_thread.start()

    # Send commands to Arduino to start the experiment
    send_command(f"SET_PIN {pin} {state}")
    send_command(f"SET_RUNTIME {runtime * 1000}")  # Convert runtime to milliseconds
    send_command("START_EXPERIMENT")

    # Wait for the experiment and recording duration
    time.sleep(runtime)

    # Stop the experiment
    send_command("STOP_EXPERIMENT")

    # Wait for video recording to finish
    video_thread.join()

    return {"message": f"Experiment and recording completed. Video saved to {file_path}"}
