import { Canvg, presets } from "canvg";
import DOMParser from "xmldom";

let offscreenCanvas;
let ctx;

onmessage = async (e) => {
  // NOTE: dummy computationally expensive function
  // for (let i = 0; i < 10000000000; i++) {}

  if (!offscreenCanvas) offscreenCanvas = e.data.offscreenCanvas;
  if (!ctx) ctx = offscreenCanvas.getContext("2d");
  const { svg } = e.data;
  offscreenCanvas.height = 500;
  offscreenCanvas.width = 600;

  const v = await Canvg.fromString(ctx, svg, presets.offscreen(DOMParser));
  await v.render();
  v.start();

  postMessage({});
};
