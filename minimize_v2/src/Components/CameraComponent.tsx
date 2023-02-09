import React, { useState, useRef } from "react";
import { Camera, CameraType } from "react-camera-pro";

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
      <Camera
        facingMode={"environment"}
        errorMessages={errorMessages}
        ref={camera}
        aspectRatio={4 / 3}
        numberOfCamerasCallback={setNumberOfCameras}
      />
      <button onClick={() => setImage(camera.current!.takePhoto())}>
        Take photo
      </button>
      {image === "" ? "" : <img src={image} alt="Taken photo" />}
      <button
        hidden={numberOfCameras <= 1}
        onClick={() => {
          camera.current!.switchCamera();
        }}
      >
        {" "}
        what{" "}
      </button>
    </div>
  );
};

export default CameraComponent;
