from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.arduino import (
    list_available_ports,
    connect_arduino,
    disconnect_arduino,
    send_command,
    camera_status,
    connect_camera,
    list_cameras,
    run_experiment_with_recording
)

router = APIRouter()

class Port(BaseModel):
    port: str

class Command(BaseModel):
    command: str

class CameraSelection(BaseModel):
    camera_index: int

class ExperimentParams(BaseModel):
    pin: int
    state: int
    runtime: int  # Runtime in seconds
    file_path: str # Optional video name

@router.get("/ports")
def get_ports():
    return {"ports": list_available_ports()}

@router.post("/connect")
def connect(port: Port):
    response = connect_arduino(port.port)
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
    return response

@router.post("/disconnect")
def disconnect():
    response = disconnect_arduino()
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
    return response

@router.post("/send-command")
def send_command_to_arduino(command: Command):
    response = send_command(command.command)
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
    return response

@router.get("/list-cameras")
def get_cameras():
    return {"cameras": list_cameras()}

@router.post("/connect-camera")
def post_connect_camera(selection: CameraSelection):
    return connect_camera(selection.camera_index)

@router.get("/camera-status")
def get_camera_status():
    return {"connected": camera_status()}

@router.post("/run-experiment")
def run_experiment(params: ExperimentParams):
    if not camera_status():
        raise HTTPException(status_code=400, detail="Camera is not connected.")
    
    response = run_experiment_with_recording(params.pin, params.state, params.runtime, params.file_path)
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
    return response

