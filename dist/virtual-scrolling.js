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
	exports['default'] = virtualScrolling;

	var _utilsJs = __webpack_require__(1);

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

	  var isNextPage = nextScrollTop > nextPageTop;
	  var isPreviousPage = nextScrollTop < currentPageTop;

	  if (isNextPage) {
	    return {
	      newPage: previousState.page + 1,
	      newScrollTop: newScrollTop - layout.jumpinessCoeff
	    };
	  }

	  if (isPreviousPage) {
	    return {
	      newPage: previousState.page - 1,
	      newScrollTop: newScrollTop + layout.jumpinessCoeff
	    };
	  }

	  // same page, no change
	  return {
	    newPage: previousState.page,
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
	  var virtualOverflow = layout.virtualHeight - layout.viewportHeight;
	  var scrollableOverflow = layout.scrollableHeight - layout.viewportHeight;
	  var overflowRatio = virtualOverflow / scrollableOverflow;
	  var newPage = Math.floor(newScrollTop * overflowRatio / layout.pageHeight);

	  return {
	    newPage: newPage,
	    newScrollTop: newScrollTop
	  };
	}

	function getLayout(_ref) {
	  var nbItems = _ref.nbItems;
	  var rowHeight = _ref.rowHeight;
	  var viewportHeight = _ref.viewportHeight;
	  var maxScrollableHeight = _ref.maxScrollableHeight;

	  var virtualHeight = nbItems * rowHeight;
	  if (!maxScrollableHeight) {
	    maxScrollableHeight = _utilsJs.getMaxSupportedCssHeight(); // eslint-disable-line no-param-reassign
	  }
	  var scrollableHeight = Math.min(maxScrollableHeight, virtualHeight);
	  // TODO(sd): coefficient to optimize, compute it?
	  var MAGIC_NUMBER = 100;
	  var pageHeight = scrollableHeight / MAGIC_NUMBER;

	  // nbPages will always be >= 1 (Math.ceil(0.0001) === 1)
	  var nbPages = Math.ceil(virtualHeight / pageHeight);
	  var jumpinessCoeff = (virtualHeight - scrollableHeight) / (nbPages - 1);

	  return {
	    viewportHeight: viewportHeight,
	    rowHeight: rowHeight,
	    virtualHeight: virtualHeight,
	    scrollableHeight: scrollableHeight,
	    jumpinessCoeff: jumpinessCoeff,
	    pageHeight: pageHeight,
	    nbPages: nbPages,
	    nbItems: nbItems
	  };
	}

	function virtualScrolling(_ref2) {
	  var nbItems = _ref2.nbItems;
	  var rowHeight = _ref2.rowHeight;
	  var viewportHeight = _ref2.viewportHeight;
	  var maxScrollableHeight = _ref2.maxScrollableHeight;

	  // compute the layout once
	  var layout = getLayout({ nbItems: nbItems, rowHeight: rowHeight, viewportHeight: viewportHeight, maxScrollableHeight: maxScrollableHeight });
	  var INITIAL_STATE = {
	    page: 0,
	    pageOffset: 0,
	    scrollTop: 0
	  };

	  return function (_ref3) {
	    var _ref3$previousState = _ref3.previousState;
	    var previousState = _ref3$previousState === undefined ? INITIAL_STATE : _ref3$previousState;
	    var scrollTop = _ref3.scrollTop;

	    // compute the scrollTop delta to know if we are going to do an
	    // absolute repositioning (page changed) or a relative (continuous)
	    var scrollDelta = Math.abs(scrollTop - previousState.scrollTop);

	    // according to the delta, update the state using the absolute or
	    // relative update

	    var _ref4 = scrollDelta > layout.viewportHeight ? onAbsoluteScroll(previousState, scrollTop, layout) : onRelativeScroll(previousState, scrollTop, layout);

	    var newPage = _ref4.newPage;
	    var newScrollTop = _ref4.newScrollTop;

	    // return the updated state
	    return {
	      page: newPage,
	      scrollTop: newScrollTop,
	      pageOffset: Math.round(newPage * layout.jumpinessCoeff)
	    };
	  };
	}

	// the caller should care of the result:
	// const hasPageChanged = (previousState.page !== newPage);
	// // if the page changed, we reposition the scrollbar (jump)
	// if (hasPageChanged) {
	//   $(layout.viewport).scrollTop(newState.scrollTop);
	// }
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.getMaxSupportedCssHeight = getMaxSupportedCssHeight;
	function getHeight(element) {
	  return +window.getComputedStyle(element).getPropertyValue('height');
	}

	function getMaxSupportedCssHeight() {
	  if (typeof window === 'undefined' || typeof document === 'undefined') {
	    throw Error('This function must be called from a browser environment only');
	  }

	  // Firefox reports the height back but still renders blank after ~6M px
	  var testUpTo = window.navigator.userAgent.toLowerCase().match(/firefox/) ? 6e6 : 1e9;

	  var div = document.createElement('div');
	  div.style.display = 'none';
	  document.body.appendChild(div);

	  var supportedHeight = 1e6;
	  while (true) {
	    // eslint-disable-line no-constant-condition
	    var testHeight = supportedHeight * 2;
	    div.style.height = testHeight + 'px';

	    // we need to use jQuery because getting the height properly depends
	    // on some much stuff. Under the hood, it's using window.getComputedStyle()
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