"use strict";
self["webpackHotUpdatereact_worker"](0,[
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var canvg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var xmldom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);





const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

onmessage = async (e) => {
  // add two build together in package json
  const { num, butterfly, offscreenCanvas } = e.data;
  console.log("isitbvu")
  offscreenCanvas.height = 500;
  offscreenCanvas.width = 500;
  const ctx = offscreenCanvas.getContext('2d')
  const v = await canvg__WEBPACK_IMPORTED_MODULE_2__.Canvg.fromString(ctx, butterfly, canvg__WEBPACK_IMPORTED_MODULE_2__.presets.offscreen(xmldom__WEBPACK_IMPORTED_MODULE_1__));
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


/***/ })
],
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("fbffe0cf909bc5399b5b")
/******/ })();
/******/ 
/******/ }
);