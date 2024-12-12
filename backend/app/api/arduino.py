from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.services.arduino import (
    list_available_ports,
    connect_arduino,
    disconnect_arduino,
    send_command,
    camera_status,
    connect_camera,
    list_cameras,
    run_experiment_with_recording,
    # configure_beam_and_led,
    # start_experiment_with_beam,
    run_beam_experiment
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
    file_path: str

# class ConfigureBeams(BaseModel):
#     beam_pin: int
#     led_pin: int

class BeamAndLedParams(BaseModel):
    beam_pin: int
    led_pin: int
    runtime: int
    file_path: str

# class ExperimentDuration(BaseModel):
#     runtime: int  # Experiment runtime in milliseconds

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
def run_experiment_route(params: ExperimentParams):
    print("Received run-experiment request:", params)
    response = run_experiment_with_recording(
        params.pin, params.state, params.runtime, params.file_path
    )
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response


# @router.post("/configure-beam-led")
# def configure_beam_led(params: ConfigureBeams):
#     response = configure_beam_and_led(params.beam_pin, params.led_pin)
#     if "error" in response:
#         raise HTTPException(status_code=500, detail=response["error"])
#     return response


# @router.post("/start-experiment")
# def start_experiment(params: ExperimentDuration):
#     response = start_experiment_with_beam(params.runtime)
#     if "error" in response:
#         raise HTTPException(status_code=500, detail=response["error"])
#     return response


@router.post("/run-beam-experiment")
def run_beam_experiment_route(params: BeamAndLedParams):
    print(f"Received params: {params.dict()}")
    response = run_beam_experiment(
        params.runtime, params.beam_pin, params.led_pin, params.file_path
    )
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response