import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { ordinal_suffix } from "./helpers";
import { reducer } from "./reducer";
import { Results } from "./Results";
import { butterfly } from "./butterfly";
function App() {
  const [info, dispatch] = React.useReducer(reducer, {
    err: "",
    num: "",
    computedFibs: [],
  });
  const [offscreenCanvas, setOffscreenCanvas] = useState();
  const canvasRef = useRef();
  const runWorker = (num, id) => {
    dispatch({ type: "SET_ERROR", err: "" });
    // const worker = new window.Worker("./fib-worker.js");
    const worker = new Worker("worker.js");
    // const worker = new Worker(new URL("./fib-worker.js"), { type: "module" });

    worker.postMessage({ num, test: "test Bar", offscreenCanvas, butterfly }, [offscreenCanvas]);
    worker.onerror = (err) => err;
    worker.onmessage = (e) => {
      const { time, fibNum } = e.data;
      dispatch({
        type: "UPDATE_FIBO",
        id,
        time,
        fibNum,
      });
      // worker.terminate();
    };
  };

  useEffect(() => {
    setOffscreenCanvas(canvasRef.current.transferControlToOffscreen());
  }, []);



  return (
    <div>
      {/* <div className="heading-container">
        <h1>Computing the nth Fibonnaci number</h1>
      </div>
      <div className="body-container">
        <p id="error" className="error">
          {info.err}
        </p>
        // ... next block of code goes here ... //
        <Results results={info.computedFibs} />
      </div> */}
      <div className="input-div">
        <input
          type="number"
          value={info.num}
          className="number-input"
          placeholder="Enter a number"
          onChange={(e) =>
            dispatch({
              type: "SET_NUMBER",
              num: window.Number(e.target.value),
            })
          }
        />
        <button
          id="submit-btn"
          className="btn-submit"
          onClick={() => {
            if (info.num < 2) {
              dispatch({
                type: "SET_ERROR",
                err: "Please enter a number greater than 2",
              });
              return;
            }
            const id = info.computedFibs.length;
            dispatch({
              type: "SET_FIBO",
              id,
              loading: true,
              nth: ordinal_suffix(info.num),
            });
            runWorker(info.num, id);
          }}
        >
          Calculate
        </button>
      </div>
      <div>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
      </div>
    </div>
  );
}
export default App;
