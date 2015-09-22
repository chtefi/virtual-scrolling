(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["virtual-scrolling"] = factory();
	else
		root["virtual-scrolling"] = factory();
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.scale = scale;
	exports['default'] = virtualScrolling;

	var _utilsJs = __webpack_require__(1);

	function scale(_ref) {
	  var input = _ref.input;
	  var output = _ref.output;

	  var inputDelta = input[1] - input[0];
	  var outputDelta = output[1] - output[0];
	  return function (value) {
	    return (value - input[0]) / inputDelta * outputDelta + output[0];
	  };
	}

	/**
	 * When an relative scroll occurs, we compute which page we land according to
	 * the new scrolltop value, or if the page does not change.
	 *
	 * @param  {object} previousState
	 * @param  {number} newScrollTop
	 * @param  {object} layout
	 * @return {object}
	 */
	function onRelativeScroll(previousState, newScrollTop, layout) {
	  var nextScrollTop = newScrollTop + previousState.pageOffset;
	  var nextPageTop = (previousState.page + 1) * layout.pageHeight;
	  var currentPageTop = previousState.page * layout.pageHeight;

	  var isNextPage = nextScrollTop >= nextPageTop;
	  var isPreviousPage = nextScrollTop < currentPageTop;

	  var scrollableToPage = scale({
	    input: [0, layout.scrollableHeight],
	    output: [0, layout.maxPage]
	  });

	  if (isNextPage) {
	    return {
	      newPage: previousState.page + 1,
	      newScrollTop: newScrollTop
	    };
	  }

	  if (isPreviousPage) {
	    return {
	      newPage: previousState.page - 1,
	      newScrollTop: newScrollTop + layout.onePageOffset
	    };
	  }

	  // same page, no change
	  return {
	    newPage: scrollableToPage(newScrollTop),
	    newScrollTop: newScrollTop
	  };
	}

	/**
	 * When an absolute scroll occurs, we compute which page we land according to
	 * the new scrolltop value.
	 *
	 * @param  {object} previousState
	 * @param  {number} newScrollTop
	 * @param  {object} layout
	 * @return {object}
	 */
	function onAbsoluteScroll(previousState, newScrollTop, layout) {
	  var scrollableToPage = scale({
	    input: [0, layout.scrollableHeight],
	    output: [0, layout.maxPage]
	  });

	  var newPage = scrollableToPage(newScrollTop);

	  // there are 10 pages ?
	  // the maxPage is something like 9.90 ? (the maxPage is the _start_ page value
	  // you can have when you go at 100% of the scrollbar)
	  //
	  // therefore, we are at the page: 9.90*0.34 = 3,366
	  // const newPage = layout.maxPage * newScrollTopRatio;

	  return {
	    newPage: newPage,
	    newScrollTop: newScrollTop
	  };
	}

	function getLayout(_ref2) {
	  var nbItems = _ref2.nbItems;
	  var rowHeight = _ref2.rowHeight;
	  var viewportHeight = _ref2.viewportHeight;
	  var _ref2$maxScrollableHeight = _ref2.maxScrollableHeight;
	  var maxScrollableHeight = _ref2$maxScrollableHeight === undefined ? _utilsJs.getMaxSupportedCssHeight() : _ref2$maxScrollableHeight;

	  var totalItemsHeight = nbItems * rowHeight;
	  var scrollableHeight = Math.min(maxScrollableHeight, totalItemsHeight);

	  // nbPages will always be >= 1 (Math.ceil(0.0001) === 1)
	  var nbPages = Math.ceil(totalItemsHeight / scrollableHeight);
	  var pageHeight = scrollableHeight / nbPages;

	  // One page examples

	  // total: 1000 / viewport: 500 / scrollableMax: 10000 / = 1 page
	  // 100% in scroll means going to the page...
	  // 100% - viewport / total
	  // 1 - 500 / 1000 = 0.50
	  // maxPage = 0.50

	  // total: 1000 / viewport: 100 / scrollableMax: 10000 / = 1 page
	  // 100% in scroll means going to the page...
	  // 100% - viewport / total
	  // 1 - 100 / 1000 = 0.90
	  // maxPage = 0.90

	  // Multiple page examples

	  // total: 1000 / viewport: 100 / scrollableMax: 100 / = 10 pages
	  // 100% in scroll means going to the page...
	  // 100% - viewport / total
	  // 10 * (1 - 100 / 1000) = 9.00

	  // therefore...
	  // maxPage = nbPages * (1 - viewportHeight / totalHeight)

	  // const virtualOverflow = totalItemsHeight - viewportHeight;
	  // const scrollableOverflow = scrollableHeight - viewportHeight;
	  // const overflowRatio = virtualOverflow / scrollableOverflow;
	  var maxPage = nbPages * (1 - viewportHeight / totalItemsHeight);

	  // TODO(sd): need ?
	  var onePageOffset = (totalItemsHeight - scrollableHeight) / (nbPages - 1);

	  //const totalItemsScale = scale({ input: [ 0, scrollableHeight ], output: [ 0, totalItemsHeight ] });
	  //const absolutePageScale = scale({ input: [ 0, viewportHeight ], output: [ 0, nbPages ] });
	  //console.log(maxPage, absolutePageScale())

	  return {
	    viewportHeight: viewportHeight,
	    rowHeight: rowHeight,
	    pageHeight: pageHeight,
	    nbItems: nbItems,
	    totalItemsHeight: totalItemsHeight,
	    scrollableHeight: scrollableHeight,
	    onePageOffset: onePageOffset,
	    nbPages: nbPages,
	    maxPage: maxPage
	  };
	}

	function virtualScrolling(_ref3) {
	  var nbItems = _ref3.nbItems;
	  var rowHeight = _ref3.rowHeight;
	  var viewportHeight = _ref3.viewportHeight;
	  var maxScrollableHeight = _ref3.maxScrollableHeight;

	  // compute the layout once
	  var layout = getLayout({ nbItems: nbItems, rowHeight: rowHeight, viewportHeight: viewportHeight, maxScrollableHeight: maxScrollableHeight });
	  var INITIAL_STATE = {
	    page: 0,
	    pageOffset: 0,
	    scrollTop: 0
	  };

	  var fn = function fn(_ref4) {
	    var _ref4$previousState = _ref4.previousState;
	    var previousState = _ref4$previousState === undefined ? INITIAL_STATE : _ref4$previousState;
	    var scrollTop = _ref4.scrollTop;

	    // limit the scrollTop value
	    scrollTop = Math.min(Math.max(scrollTop, 0), layout.scrollableHeight); // eslint-disable-line no-param-reassign

	    // compute the scrollTop delta to know if we are going to do an
	    // absolute repositioning (page changed) or a relative (continuous)
	    var scrollDelta = Math.abs(scrollTop - previousState.scrollTop);

	    // according to the delta, update the state using the absolute or
	    // relative update

	    var _ref5 = scrollDelta > layout.viewportHeight ? onAbsoluteScroll(previousState, scrollTop, layout) : onRelativeScroll(previousState, scrollTop, layout);

	    var newPage = _ref5.newPage;
	    var newScrollTop = _ref5.newScrollTop;

	    // return the updated state
	    return {
	      page: newPage,
	      scrollTop: newScrollTop,
	      pageOffset: Math.round(newPage * layout.onePageOffset)
	    };
	  };

	  fn.layout = layout;

	  return fn;
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.getMaxSupportedCssHeight = getMaxSupportedCssHeight;
	function getHeight(element) {
	  // remove 'px' at the end then cast to integer
	  return +window.getComputedStyle(element).getPropertyValue('height').slice(0, -2);
	}

	function getMaxSupportedCssHeight() {
	  if (typeof window === 'undefined' || typeof document === 'undefined') {
	    throw Error('This function must be called from a browser environment only');
	  }

	  // Firefox reports the height back but still renders blank after ~6M px
	  var testUpTo = window.navigator.userAgent.toLowerCase().match(/firefox/) ? 6e6 : 1e9; // 1MM ! Chrome is at 35M so this limit is fine.

	  var div = document.createElement('div');
	  div.style.display = 'none';
	  document.body.appendChild(div);

	  var supportedHeight = 1e6;
	  // TODO(sd) : refactor this condition
	  while (true) {
	    // eslint-disable-line no-constant-condition
	    var testHeight = supportedHeight * 2;
	    div.style.height = testHeight + 'px';

	    // if we detect a difference, it means the browser reached its limit
	    if (testHeight > testUpTo || getHeight(div) !== testHeight) {
	      break;
	    } else {
	      supportedHeight = testHeight;
	    }
	  }

	  document.body.removeChild(div);
	  return supportedHeight;
	}

/***/ }
/******/ ])
});
;