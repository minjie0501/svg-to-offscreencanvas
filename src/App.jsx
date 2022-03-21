import React, { useEffect, useRef, useState } from "react";
import { butterfly, floorplan, tiger, world } from "./examples";
import * as Comlink from "comlink";

function App() {
  const [offscreenCanvas, setOffscreenCanvas] = useState();
  const [svg, setSvg] = useState("");
  const canvasRef = useRef();
  const [worker, setWorker] = useState();
  const checkRef = useRef(true);

  const runWorker = async () => {
    if (checkRef.current) {
      const obj = Comlink.wrap(worker);
      await obj.getCanvas(Comlink.transfer(offscreenCanvas, [offscreenCanvas]));
      await obj.renderSvg(svg);
      checkRef.current = false;
    } else {
      const obj = Comlink.wrap(worker);
      await obj.renderSvg(svg);
    }
  };

  const handleClick = (e) => {
    setSvg(e.target.value);
    runWorker();
  };

  useEffect(() => {
    setWorker(new Worker("worker.js"));
    setSvg(butterfly);
    setOffscreenCanvas(canvasRef.current.transferControlToOffscreen());
  }, []);

  return (
    <div className="flex m-10 ">
      <div className="flex flex-col items-center justify-center">
        <select name="svgs" id="" onChange={(e) => setSvg(e.target.value)} className="border-gray-600 border">
          <option value={butterfly}>Butterfly</option>
          <option value={floorplan}>Floorplan</option>
          <option value={world}>World</option>
          <option value={tiger}>Tiger</option>
        </select>
        {/* <label htmlFor="svg" className="text-xl font-bold">
          Enter svg (default butterfly)
        </label> */}
        {/* <textarea
          className="border-gray-800 border"
          name="svg"
          id=""
          cols="70"
          rows="30"
          value={svg}
          onChange={(e) => setSvg(e.target.value)}
        ></textarea> */}
      </div>
      <input type="text" />
      <div className="flex justify-center items-center w-full">
        <button className="bg-blue-200 w-24 h-24 m-4" onClick={handleClick}>
          Render
        </button>
      </div>
      <div className="flex flex-col justify-center items-center  w-full">
        <h2>Canvas</h2>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
      </div>
    </div>
  );
}
export default App;
