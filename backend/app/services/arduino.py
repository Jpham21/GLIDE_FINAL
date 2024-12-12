import serial
from serial.tools import list_ports
import cv2
import os
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
        time.sleep(2)  # Allow Arduino to reset
        arduino_connection.flushInput()  # Clear residual data
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
            # Clear the serial buffer
            while arduino_connection.in_waiting > 0:
                arduino_connection.readline()

            arduino_connection.write(f"{command}\n".encode())
            time.sleep(0.1)  # Allow Arduino time to process

            # Read and return the response
            if arduino_connection.in_waiting > 0:
                response = arduino_connection.readline().decode().strip()
                print(f"Arduino response: {response}")
                return response
            return "No response from Arduino"
        return {"error": "Arduino is not connected"}
    except Exception as e:
        return {"error": f"Error sending command: {e}"}


# Function to list available cameras
def list_cameras():
    available_cameras = []
    for i in range(5):  # Check up to 5 camera indices
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            available_cameras.append(f"Camera {i}")
            cap.release()
    return available_cameras

# Function to connect to a camera
def connect_camera(camera_index: int):
    global camera
    if camera is not None and camera.isOpened():
        return {"message": "Camera is already connected."}

    camera = cv2.VideoCapture(camera_index)
    if not camera.isOpened():
        return {"error": f"Unable to access camera {camera_index}."}
    return {"message": f"Camera {camera_index} connected successfully."}

# Function to check camera status
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

    if not file_path or not isinstance(file_path, str):
        return {"error": "Invalid file path provided."}

    try:
        # Initialize video writer
        fps = 30.0
        frame_width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(file_path, fourcc, fps, (frame_width, frame_height))
        print(f"Video writer initialized: {file_path}")

        # Start experiment
        send_command(f"SET_PIN {pin} {state}")
        send_command(f"SET_RUNTIME {runtime * 1000}")
        send_command("START_EXPERIMENT")

        # Allow camera to warm up
        time.sleep(0.5)
        for _ in range(10):
            camera.read()

        # Record video
        total_frames = int(runtime * fps)
        for frame_count in range(total_frames):
            ret, frame = camera.read()
            if ret:
                video_writer.write(frame)
                print(f"Frame {frame_count + 1}/{total_frames} captured.")
            else:
                print(f"Failed to capture frame {frame_count + 1}")
                break

        # Stop experiment
        send_command("STOP_EXPERIMENT")
    except Exception as e:
        return {"error": f"Error during experiment: {e}"}
    finally:
        if video_writer:
            video_writer.release()

    return {"message": f"Experiment completed. Video saved to {file_path}"}

# Function to run beam break experiment
def run_beam_experiment(runtime, beam_pin, led_pin, file_path):
    global arduino_connection, camera, video_writer

    if arduino_connection is None or not arduino_connection.is_open:
        return {"error": "Arduino is not connected."}

    if camera is None or not camera.isOpened():
        return {"error": "Camera is not connected."}

    if not file_path or not isinstance(file_path, str):
        return {"error": "Invalid file path provided."}

    try:
        # Configure beam break sensor and LED pins
        response = send_command(f"SET_BEAM_LED {beam_pin} {led_pin}")
        if "configured" not in response.lower():
            return {"error": f"Unexpected Arduino response: {response}"}

        # Initialize video writer
        fps = 30.0
        frame_width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(file_path, fourcc, fps, (frame_width, frame_height))
        print(f"Video writer initialized: {file_path}")

        # Start experiment
        send_command(f"SET_RUNTIME {runtime * 1000}")
        send_command("START_EXPERIMENT")

        # Allow camera to warm up
        time.sleep(0.5)
        for _ in range(10):
            camera.read()

        # Record video
        total_frames = int(runtime * fps)
        for frame_count in range(total_frames):
            ret, frame = camera.read()
            if ret:
                video_writer.write(frame)
                print(f"Frame {frame_count + 1}/{total_frames} captured.")
            else:
                print(f"Failed to capture frame {frame_count + 1}")
                break

        # Stop experiment
        send_command("STOP_EXPERIMENT")
    except Exception as e:
        return {"error": f"Error during beam break experiment: {e}"}
    finally:
        if video_writer:
            video_writer.release()

    return {"message": f"Beam break experiment completed. Video saved to {file_path}"}
