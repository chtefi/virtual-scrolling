(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["number-converter-alphabet"] = factory();
	else
		root["number-converter-alphabet"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = virtualScrolling;
	function onRelativeScroll(state, layout) {
	  var nextScrollTop = state.scrollTop + state.pageOffset;
	  var nextPageTop = (state.page + 1) * layout.pageHeight;
	  var currentPageTop = state.page * layout.pageHeight;

	  var isNextPage = nextScrollTop > nextPageTop;
	  var isPreviousPage = nextScrollTop < currentPageTop;

	  var page = state.page;
	  var scrollTop = state.scrollTop;

	  if (isNextPage) {
	    page++;
	    scrollTop = state.scrollTop - layout.jumpinessCoefficient;
	  } else if (isPreviousPage) {
	    page--;
	    scrollTop = state.scrollTop + layout.jumpinessCoefficient;
	  }

	  return {
	    page: page,
	    scrollTop: scrollTop
	  };
	}

	// on absolute, we compute which page we land according to the scrolltop
	function onAbsoluteScroll(state, layout) {
	  var virtualOverflow = layout.virtualHeight - layout.viewportHeight;
	  var scrollableOverflow = layout.scrollableHeight - layout.viewportHeight;
	  var overflowRatio = virtualOverflow / scrollableOverflow;
	  var newPage = Math.floor(state.scrollTop * overflowRatio / layout.pageHeight);

	  return {
	    page: newPage,
	    scrollTop: state.scrollTop
	  };
	}

	function virtualScrolling(state, layout, newScrollTop, updateViewportScrollTop) {
	  // compute the scrollTop delta to know if we are going to do an
	  // absolute repositioning (page changed) or a relative (continuous)
	  var scrollDelta = Math.abs(newScrollTop - state.scrollTop);

	  // update the current state
	  state.scrollTop = newScrollTop;

	  // according to the delta, update the state using the absolute or
	  // relative update
	  var newState = scrollDelta > layout.viewportHeight ? onAbsoluteScroll(state, layout) : onRelativeScroll(state, layout);

	  var hasPageChanged = state.page !== newState.page;

	  // if the page changed, we reposition the scrollbar (jump)
	  if (hasPageChanged) {
	    updateViewportScrollTop(newState.scrollTop);
	  }

	  // merge state
	  state.page = newState.page;
	  state.scrollTop = newState.scrollTop;
	  state.pageOffset = Math.round(state.page * layout.jumpinessCoefficient);

	  return state;
	}

	module.exports = exports["default"];

/***/ }
/******/ ])
});
;