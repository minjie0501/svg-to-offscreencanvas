import { Canvg, presets } from "canvg";
import DOMParser from "xmldom";

onmessage = async (e) => {

  // NOTE: dummy computationally expensive function
  // for (let i = 0; i < 10000000000; i++) {}

  const { butterfly, offscreenCanvas } = e.data;
  console.log("trest");
  offscreenCanvas.height = 500;
  offscreenCanvas.width = 500;
  const ctx = offscreenCanvas.getContext("2d");
  const v = await Canvg.fromString(ctx, butterfly, presets.offscreen(DOMParser));
  console.log(v.document);
  await v.render();
  v.start();

  postMessage({});
};
