import { Canvg, presets } from "canvg";
import DOMParser from "xmldom";
import * as Comlink from "comlink";

const obj = {
  offscreenCanvas: null,
  ctx: null,
  getCanvas(offscreenCanvas) {
    if (!this.offscreenCanvas) this.offscreenCanvas = offscreenCanvas;
    if (!this.ctx) this.ctx = this.offscreenCanvas.getContext("2d");
  },
  async renderSvg(svg) {
    console.log(this.offscreenCanvas);
    this.offscreenCanvas.height = 550;
    this.offscreenCanvas.width = 650;
    const v = await Canvg.fromString(this.ctx, svg, presets.offscreen(DOMParser));
    await v.render();
    v.start();
  },
};

Comlink.expose(obj);
