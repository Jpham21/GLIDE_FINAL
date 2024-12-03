import serial
import serial.tools.list_ports

arduino = None  # Global Arduino serial connection object

def list_ports():
    """
    List all available serial ports.
    """
    ports = serial.tools.list_ports.comports()
    return [{"device": port.device, "description": port.description} for port in ports]


def connect_arduino(port: str, baudrate: int = 9600):
    """
    Connect to the Arduino using the specified serial port.
    """
    global arduino
    if arduino and arduino.is_open:
        raise Exception("Arduino is already connected.")

    try:
        arduino = serial.Serial(port, baudrate, timeout=1)
        print(f"Arduino connected on {port}")
    except Exception as e:
        raise Exception(f"Failed to connect to Arduino: {str(e)}")


def disconnect_arduino():
    """
    Disconnect the Arduino.
    """
    global arduino
    if arduino and arduino.is_open:
        arduino.close()
        arduino = None
        print("Arduino disconnected.")
    else:
        raise Exception("Arduino is not connected.")


def get_connection_status():
    """
    Check if the Arduino is connected.
    """
    return arduino is not None and arduino.is_open

def write_command(command: str):
    """
    Write a command to the Arduino.
    """
    if not arduino or not arduino.is_open:
        raise Exception("Arduino is not connected.")

    try:
        arduino.write((command + '\n').encode())  # Send command with newline
        print(f"Command sent to Arduino: {command}")
    except Exception as e:
        raise Exception(f"Failed to send command: {str(e)}")
