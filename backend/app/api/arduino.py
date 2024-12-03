from fastapi import APIRouter, HTTPException
from app.services.arduino import list_ports, connect_arduino, disconnect_arduino, get_connection_status, write_command
from pydantic import BaseModel

router = APIRouter()

class ConnectRequest(BaseModel):
    port: str 

class CommandRequest(BaseModel):
    command: str 
    
@router.get("/ports")
def get_ports():
    """
    List all available serial ports.
    """
    try:
        return list_ports()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connect")
def connect_route(request: ConnectRequest):
    """
    Connect to the Arduino.
    """
    try:
        connect_arduino(request.port)  # Extract 'port' from the validated request
        return {"status": "connected", "port": request.port}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disconnect")
def disconnect_route():
    """
    Disconnect the Arduino.
    """
    try:
        disconnect_arduino()
        return {"status": "disconnected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
def get_status():
    """
    Get the connection status of the Arduino.
    """
    try:
        return {"connected": get_connection_status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/write")
def write_command_route(request: CommandRequest):
    """
    Write a command to the Arduino.
    """
    try:
        write_command(request.command)
        return {"status": "success", "command": request.command}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))