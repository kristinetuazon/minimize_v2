import React, { useState, useRef } from "react";
import {Camera, CameraType} from "react-camera-pro";

const errorMessages = {
    noCameraAccessible: "Sorry, no camera accessible.",
    permissionDenied: "Sorry, permission to your camera is denied.",
    switchCamera: "Sorry, switch your camera to a different view.",
    canvas: "Sorry, canvas is not available.",
  };

const CameraComponent = () => {
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    const [image, setImage] = useState<string>("");
    const camera = useRef<CameraType>(null);

  return (
    <div>
      <Camera errorMessages={errorMessages} ref={camera}  aspectRatio="cover" numberOfCamerasCallback={setNumberOfCameras}/>
      <button onClick={() => setImage(camera.current!.takePhoto())}>Take photo</button>
      <img src={image} alt='Taken photo'/>
    </div>
  );
}

export default CameraComponent;