import _ from "lodash";
import { Canvg, presets } from "canvg";
import DOMParser from 'xmldom'


const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

onmessage = async (e) => {
  // add two build together in package json
  const { num, butterfly, offscreenCanvas } = e.data;
  console.log("isitbvu")
  offscreenCanvas.height = 500;
  offscreenCanvas.width = 500;
  const ctx = offscreenCanvas.getContext('2d')
  const v = await Canvg.fromString(ctx, butterfly, presets.offscreen(DOMParser));
  console.log(v.document);
  await v.render()
  v.start()



  const startTime = new Date().getTime();
  const fibNum = fib(num);
  postMessage({
    fibNum,
    time: new Date().getTime() - startTime,
  });
};
