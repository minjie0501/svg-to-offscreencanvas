import React, { useEffect, useRef, useState } from "react";
import { butterfly } from "./butterfly";



function App() {
  const [offscreenCanvas, setOffscreenCanvas] = useState();
  const canvasRef = useRef();
  const runWorker = () => {
    const worker = new Worker("worker.js");

    worker.postMessage({ offscreenCanvas, butterfly }, [offscreenCanvas]);
    worker.onmessage = (e) => {
      // worker.terminate();
    };
  };

  useEffect(() => {
    setOffscreenCanvas(canvasRef.current.transferControlToOffscreen());
  }, []);

  return (
    <div>
      <textarea name="" id="" cols="30" rows="10" placeholder={butterfly}></textarea>
      <button onClick={runWorker}>Render</button>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
    </div>
  );
}
export default App;
