var PathLoader =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Jeremy Whitlock
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var supportedLoaders = {
  file: __webpack_require__(/*! ./lib/loaders/file */ "./lib/loaders/file-browser.js"),
  http: __webpack_require__(/*! ./lib/loaders/http */ "./lib/loaders/http.js"),
  https: __webpack_require__(/*! ./lib/loaders/http */ "./lib/loaders/http.js")
};
var defaultLoader = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' || typeof importScripts === 'function' ? supportedLoaders.http : supportedLoaders.file;

// Load promises polyfill if necessary
/* istanbul ignore if */
if (typeof Promise === 'undefined') {
  __webpack_require__(/*! native-promise-only */ "./node_modules/native-promise-only/lib/npo.src.js");
}

function getScheme(location) {
  if (typeof location !== 'undefined') {
    location = location.indexOf('://') === -1 ? '' : location.split('://')[0];
  }

  return location;
}

/**
 * Utility that provides a single API for loading the content of a path/URL.
 *
 * @module path-loader
 */

function getLoader(location) {
  var scheme = getScheme(location);
  var loader = supportedLoaders[scheme];

  if (typeof loader === 'undefined') {
    if (scheme === '') {
      loader = defaultLoader;
    } else {
      throw new Error('Unsupported scheme: ' + scheme);
    }
  }

  return loader;
}

/**
 * Loads a document at the provided location and returns a JavaScript object representation.
 *
 * @param {string} location - The location to the document
 * @param {module:path-loader.LoadOptions} [options] - The loader options
 *
 * @returns {Promise<*>} Always returns a promise even if there is a callback provided
 *
 * @example
 * // Example using Promises
 *
 * PathLoader
 *   .load('./package.json')
 *   .then(JSON.parse)
 *   .then(function (document) {
 *     console.log(document.name + ' (' + document.version + '): ' + document.description);
 *   }, function (err) {
 *     console.error(err.stack);
 *   });
 *
 * @example
 * // Example using options.prepareRequest to provide authentication details for a remotely secure URL
 *
 * PathLoader
 *   .load('https://api.github.com/repos/whitlockjc/path-loader', {
 *     prepareRequest: function (req, callback) {
 *       req.auth('my-username', 'my-password');
 *       callback(undefined, req);
 *     }
 *   })
 *   .then(JSON.parse)
 *   .then(function (document) {
 *     console.log(document.full_name + ': ' + document.description);
 *   }, function (err) {
 *     console.error(err.stack);
 *   });
 *
 * @example
 * // Example loading a YAML file
 *
 * PathLoader
 *   .load('/Users/not-you/projects/path-loader/.travis.yml')
 *   .then(YAML.safeLoad)
 *   .then(function (document) {
 *     console.log('path-loader uses the', document.language, 'language.');
 *   }, function (err) {
 *     console.error(err.stack);
 *   });
 *
 * @example
 * // Example loading a YAML file with options.processContent (Useful if you need information in the raw response)
 *
 * PathLoader
 *   .load('/Users/not-you/projects/path-loader/.travis.yml', {
 *     processContent: function (res, callback) {
 *       callback(YAML.safeLoad(res.text));
 *     }
 *   })
 *   .then(function (document) {
 *     console.log('path-loader uses the', document.language, 'language.');
 *   }, function (err) {
 *     console.error(err.stack);
 *   });
 */
module.exports.load = function (location, options) {
  var allTasks = Promise.resolve();

  // Default options to empty object
  if (typeof options === 'undefined') {
    options = {};
  }

  // Validate arguments
  allTasks = allTasks.then(function () {
    if (typeof location === 'undefined') {
      throw new TypeError('location is required');
    } else if (typeof location !== 'string') {
      throw new TypeError('location must be a string');
    }

    if (typeof options !== 'undefined') {
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
        throw new TypeError('options must be an object');
      } else if (typeof options.processContent !== 'undefined' && typeof options.processContent !== 'function') {
        throw new TypeError('options.processContent must be a function');
      }
    }
  });

  // Load the document from the provided location and process it
  allTasks = allTasks.then(function () {
    return new Promise(function (resolve, reject) {
      var loader = getLoader(location);

      loader.load(location, options || {}, function (err, document) {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    });
  }).then(function (res) {
    if (options.processContent) {
      return new Promise(function (resolve, reject) {
        // For consistency between file and http, always send an object with a 'text' property containing the raw
        // string value being processed.
        if ((typeof res === 'undefined' ? 'undefined' : _typeof(res)) !== 'object') {
          res = { text: res };
        }

        // Pass the path being loaded
        res.location = location;

        options.processContent(res, function (err, processed) {
          if (err) {
            reject(err);
          } else {
            resolve(processed);
          }
        });
      });
    } else {
      // If there was no content processor, we will assume that for all objects that it is a Superagent response
      // and will return its `text` property value.  Otherwise, we will return the raw response.
      return (typeof res === 'undefined' ? 'undefined' : _typeof(res)) === 'object' ? res.text : res;
    }
  });

  return allTasks;
};

/***/ }),

/***/ "./lib/loaders/file-browser.js":
/*!*************************************!*\
  !*** ./lib/loaders/file-browser.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Jeremy Whitlock
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



var unsupportedError = new TypeError('The \'file\' scheme is not supported in the browser');

/**
 * The file loader is not supported in the browser.
 *
 * @throws {error} the file loader is not supported in the browser
 */
module.exports.getBase = function () {
  throw unsupportedError;
};

/**
 * The file loader is not supported in the browser.
 */
module.exports.load = function () {
  var fn = arguments[arguments.length - 1];

  if (typeof fn === 'function') {
    fn(unsupportedError);
  } else {
    throw unsupportedError;
  }
};

/***/ }),

/***/ "./lib/loaders/http.js":
/*!*****************************!*\
  !*** ./lib/loaders/http.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* eslint-env node, browser */

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Jeremy Whitlock
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



var request = __webpack_require__(/*! superagent */ "./node_modules/superagent/lib/client.js");

var supportedHttpMethods = ['delete', 'get', 'head', 'patch', 'post', 'put'];

/**
 * Loads a file from an http or https URL.
 *
 * @param {string} location - The document URL (If relative, location is relative to window.location.origin).
 * @param {object} options - The loader options
 * @param {string} [options.method=get] - The HTTP method to use for the request
 * @param {module:PathLoader~PrepareRequestCallback} [options.prepareRequest] - The callback used to prepare a request
 * @param {module:PathLoader~ProcessResponseCallback} [options.processContent] - The callback used to process the
 * response
 * @param {function} callback - The error-first callback
 */
module.exports.load = function (location, options, callback) {
  var realMethod = options.method ? options.method.toLowerCase() : 'get';
  var err;
  var realRequest;

  function makeRequest(err, req) {
    if (err) {
      callback(err);
    } else {
      // buffer() is only available in Node.js
      if (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]' && typeof req.buffer === 'function') {
        req.buffer(true);
      }

      req.end(function (err2, res) {
        if (err2) {
          callback(err2);
        } else {
          callback(undefined, res);
        }
      });
    }
  }

  if (typeof options.method !== 'undefined') {
    if (typeof options.method !== 'string') {
      err = new TypeError('options.method must be a string');
    } else if (supportedHttpMethods.indexOf(options.method) === -1) {
      err = new TypeError('options.method must be one of the following: ' + supportedHttpMethods.slice(0, supportedHttpMethods.length - 1).join(', ') + ' or ' + supportedHttpMethods[supportedHttpMethods.length - 1]);
    }
  } else if (typeof options.prepareRequest !== 'undefined' && typeof options.prepareRequest !== 'function') {
    err = new TypeError('options.prepareRequest must be a function');
  }

  if (!err) {
    realRequest = request[realMethod === 'delete' ? 'del' : realMethod](location);

    if (options.prepareRequest) {
      try {
        options.prepareRequest(realRequest, makeRequest);
      } catch (err2) {
        callback(err2);
      }
    } else {
      makeRequest(undefined, realRequest);
    }
  } else {
    callback(err);
  }
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/call-bind/callBound.js":
/*!*********************************************!*\
  !*** ./node_modules/call-bind/callBound.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var callBind = __webpack_require__(/*! ./ */ "./node_modules/call-bind/index.js");

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

/***/ }),

/***/ "./node_modules/call-bind/index.js":
/*!*****************************************!*\
  !*** ./node_modules/call-bind/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(func, 'length', { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) });
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

/***/ }),

/***/ "./node_modules/component-emitter/index.js":
/*!*************************************************!*\
  !*** ./node_modules/component-emitter/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn) {
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function (event) {
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1),
      callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function (event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function (event) {
  return !!this.listeners(event).length;
};

/***/ }),

/***/ "./node_modules/fast-safe-stringify/index.js":
/*!***************************************************!*\
  !*** ./node_modules/fast-safe-stringify/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = stringify;
stringify.default = stringify;
stringify.stable = deterministicStringify;
stringify.stableStringify = deterministicStringify;

var LIMIT_REPLACE_NODE = '[...]';
var CIRCULAR_REPLACE_NODE = '[Circular]';

var arr = [];
var replacerStack = [];

function defaultOptions() {
  return {
    depthLimit: Number.MAX_SAFE_INTEGER,
    edgesLimit: Number.MAX_SAFE_INTEGER
  };
}

// Regular stringify
function stringify(obj, replacer, spacer, options) {
  if (typeof options === 'undefined') {
    options = defaultOptions();
  }

  decirc(obj, '', 0, [], undefined, 0, options);
  var res;
  try {
    if (replacerStack.length === 0) {
      res = JSON.stringify(obj, replacer, spacer);
    } else {
      res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
    }
  } catch (_) {
    return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
  } finally {
    while (arr.length !== 0) {
      var part = arr.pop();
      if (part.length === 4) {
        Object.defineProperty(part[0], part[1], part[3]);
      } else {
        part[0][part[1]] = part[2];
      }
    }
  }
  return res;
}

function setReplace(replace, val, k, parent) {
  var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
  if (propertyDescriptor.get !== undefined) {
    if (propertyDescriptor.configurable) {
      Object.defineProperty(parent, k, { value: replace });
      arr.push([parent, k, val, propertyDescriptor]);
    } else {
      replacerStack.push([val, k, replace]);
    }
  } else {
    parent[k] = replace;
    arr.push([parent, k, val]);
  }
}

function decirc(val, k, edgeIndex, stack, parent, depth, options) {
  depth += 1;
  var i;
  if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
        return;
      }
    }

    if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }

    if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }

    stack.push(val);
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, i, stack, val, depth, options);
      }
    } else {
      var keys = Object.keys(val);
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        decirc(val[key], key, i, stack, val, depth, options);
      }
    }
    stack.pop();
  }
}

// Stable-stringify
function compareFunction(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function deterministicStringify(obj, replacer, spacer, options) {
  if (typeof options === 'undefined') {
    options = defaultOptions();
  }

  var tmp = deterministicDecirc(obj, '', 0, [], undefined, 0, options) || obj;
  var res;
  try {
    if (replacerStack.length === 0) {
      res = JSON.stringify(tmp, replacer, spacer);
    } else {
      res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
    }
  } catch (_) {
    return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
  } finally {
    // Ensure that we restore the object as it was.
    while (arr.length !== 0) {
      var part = arr.pop();
      if (part.length === 4) {
        Object.defineProperty(part[0], part[1], part[3]);
      } else {
        part[0][part[1]] = part[2];
      }
    }
  }
  return res;
}

function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
  depth += 1;
  var i;
  if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
        return;
      }
    }
    try {
      if (typeof val.toJSON === 'function') {
        return;
      }
    } catch (_) {
      return;
    }

    if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }

    if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return;
    }

    stack.push(val);
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, i, stack, val, depth, options);
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {};
      var keys = Object.keys(val).sort(compareFunction);
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        deterministicDecirc(val[key], key, i, stack, val, depth, options);
        tmp[key] = val[key];
      }
      if (typeof parent !== 'undefined') {
        arr.push([parent, k, val]);
        parent[k] = tmp;
      } else {
        return tmp;
      }
    }
    stack.pop();
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as replaced value
function replaceGetterValues(replacer) {
  replacer = typeof replacer !== 'undefined' ? replacer : function (k, v) {
    return v;
  };
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i];
        if (part[1] === key && part[0] === val) {
          val = part[2];
          replacerStack.splice(i, 1);
          break;
        }
      }
    }
    return replacer.call(this, key, val);
  };
}

/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function binder() {
        if (this instanceof bound) {
            var result = target.apply(this, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(that, args.concat(slice.call(arguments)));
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;

/***/ }),

/***/ "./node_modules/get-intrinsic/index.js":
/*!*********************************************!*\
  !*** ./node_modules/get-intrinsic/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function getEvalledConstructor(expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function throwTypeError() {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function () {
	try {
		// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
		arguments.callee; // IE 8 does not throw here
		return throwTypeError;
	} catch (calleeThrows) {
		try {
			// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
			return $gOPD(arguments, 'callee').get;
		} catch (gOPDthrows) {
			return throwTypeError;
		}
	}
}() : throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();

var getProto = Object.getPrototypeOf || function (x) {
	return x.__proto__;
}; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': (typeof JSON === 'undefined' ? 'undefined' : _typeof(JSON)) === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var hasOwn = __webpack_require__(/*! has */ "./node_modules/has/src/index.js");
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/g, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && i + 1 >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') {
		return false;
	}
	if (typeof Symbol !== 'function') {
		return false;
	}
	if (_typeof(origSymbol('foo')) !== 'symbol') {
		return false;
	}
	if (_typeof(Symbol('bar')) !== 'symbol') {
		return false;
	}

	return hasSymbolSham();
};

/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
		return false;
	}
	if (_typeof(Symbol.iterator) === 'symbol') {
		return true;
	}

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') {
		return false;
	}

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
		return false;
	}
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
		return false;
	}

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) {
		return false;
	} // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
		return false;
	}

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
		return false;
	}

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) {
		return false;
	}

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
		return false;
	}

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) {
			return false;
		}
	}

	return true;
};

/***/ }),

/***/ "./node_modules/has/src/index.js":
/*!***************************************!*\
  !*** ./node_modules/has/src/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

/***/ }),

/***/ "./node_modules/native-promise-only/lib/npo.src.js":
/*!*********************************************************!*\
  !*** ./node_modules/native-promise-only/lib/npo.src.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, setImmediate) {var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name, context, definition) {
	// special form of UMD for polyfilling across evironments
	context[name] = context[name] || definition();
	if ( true && module.exports) {
		module.exports = context[name];
	} else if (true) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function $AMD$() {
			return context[name];
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
})("Promise", typeof global != "undefined" ? global : undefined, function DEF() {
	/*jshint validthis:true */
	"use strict";

	var builtInProp,
	    cycle,
	    scheduling_queue,
	    ToString = Object.prototype.toString,
	    timer = typeof setImmediate != "undefined" ? function timer(fn) {
		return setImmediate(fn);
	} : setTimeout;

	// dammit, IE8.
	try {
		Object.defineProperty({}, "x", {});
		builtInProp = function builtInProp(obj, name, val, config) {
			return Object.defineProperty(obj, name, {
				value: val,
				writable: true,
				configurable: config !== false
			});
		};
	} catch (err) {
		builtInProp = function builtInProp(obj, name, val) {
			obj[name] = val;
			return obj;
		};
	}

	// Note: using a queue instead of array for efficiency
	scheduling_queue = function Queue() {
		var first, last, item;

		function Item(fn, self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn, self) {
				item = new Item(fn, self);
				if (last) {
					last.next = item;
				} else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function drain() {
				var f = first;
				first = last = cycle = void 0;

				while (f) {
					f.fn.call(f.self);
					f = f.next;
				}
			}
		};
	}();

	function schedule(fn, self) {
		scheduling_queue.add(fn, self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then,
		    o_type = typeof o === "undefined" ? "undefined" : _typeof(o);

		if (o != null && (o_type == "object" || o_type == "function")) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i = 0; i < this.chain.length; i++) {
			notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self, cb, chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			} else {
				if (cb === true) {
					ret = self.msg;
				} else {
					ret = cb.call(void 0, self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				} else if (_then = isThenable(ret)) {
					_then.call(ret, chain.resolve, chain.reject);
				} else {
					chain.resolve(ret);
				}
			}
		} catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then,
		    self = this;

		// already triggered?
		if (self.triggered) {
			return;
		}

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				schedule(function () {
					var def_wrapper = new MakeDefWrapper(self);
					try {
						_then.call(msg, function $resolve$() {
							resolve.apply(def_wrapper, arguments);
						}, function $reject$() {
							reject.apply(def_wrapper, arguments);
						});
					} catch (err) {
						reject.call(def_wrapper, err);
					}
				});
			} else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify, self);
				}
			}
		} catch (err) {
			reject.call(new MakeDefWrapper(self), err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) {
			return;
		}

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify, self);
		}
	}

	function iteratePromises(Constructor, arr, resolver, rejecter) {
		for (var idx = 0; idx < arr.length; idx++) {
			(function IIFE(idx) {
				Constructor.resolve(arr[idx]).then(function $resolver$(msg) {
					resolver(idx, msg);
				}, rejecter);
			})(idx);
		}
	}

	function MakeDefWrapper(self) {
		this.def = self;
		this.triggered = false;
	}

	function MakeDef(self) {
		this.promise = self;
		this.state = 0;
		this.triggered = false;
		this.chain = [];
		this.msg = void 0;
	}

	function Promise(executor) {
		if (typeof executor != "function") {
			throw TypeError("Not a function");
		}

		if (this.__NPO__ !== 0) {
			throw TypeError("Not a promise");
		}

		// instance shadowing the inherited "brand"
		// to signal an already "initialized" promise
		this.__NPO__ = 1;

		var def = new MakeDef(this);

		this["then"] = function then(success, failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve, reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify, def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0, failure);
		};

		try {
			executor.call(void 0, function publicResolve(msg) {
				resolve.call(def, msg);
			}, function publicReject(msg) {
				reject.call(def, msg);
			});
		} catch (err) {
			reject.call(def, err);
		}
	}

	var PromisePrototype = builtInProp({}, "constructor", Promise,
	/*configurable=*/false);

	// Note: Android 4 cannot use `Object.defineProperty(..)` here
	Promise.prototype = PromisePrototype;

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype, "__NPO__", 0,
	/*configurable=*/false);

	builtInProp(Promise, "resolve", function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && (typeof msg === "undefined" ? "undefined" : _typeof(msg)) == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise, "reject", function Promise$reject(msg) {
		return new this(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise, "all", function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length,
			    msgs = Array(len),
			    count = 0;

			iteratePromises(Constructor, arr, function resolver(idx, msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			}, reject);
		});
	});

	builtInProp(Promise, "race", function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor, arr, function resolver(idx, msg) {
				resolve(msg);
			}, reject);
		});
	});

	return Promise;
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../../timers-browserify/main.js */ "./node_modules/timers-browserify/main.js").setImmediate))

/***/ }),

/***/ "./node_modules/object-inspect/index.js":
/*!**********************************************!*\
  !*** ./node_modules/object-inspect/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (_typeof(Symbol.toStringTag) === hasShammedSymbols ? 'object' : 'symbol') ? Symbol.toStringTag : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype // eslint-disable-line no-proto
? function (O) {
    return O.__proto__; // eslint-disable-line no-proto
} : null);

function addNumericSeparator(num, str) {
    if (num === Infinity || num === -Infinity || num !== num || num && num > -1000 && num < 1000 || $test.call(/e/, str)) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace.call(str, sepRegex, '$&_');
}

var utilInspect = __webpack_require__(/*! ./util.inspect */ 0);
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;

module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number' ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (has(opts, 'indent') && opts.indent !== null && opts.indent !== '\t' && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') {
        depth = 0;
    }
    if (depth >= maxDepth && maxDepth > 0 && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) {
        // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) {
            s += '...';
        }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) {
            return '[]';
        }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) {
            return '[' + String(obj) + ']';
        }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        mapForEach.call(obj, function (value, key) {
            mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
        });
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        setForEach.call(obj, function (value) {
            setParts.push(inspect(value, obj));
        });
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) {
            return tag + '{}';
        }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace.call(String(s), /"/g, '&quot;');
}

function isArray(obj) {
    return toStr(obj) === '[object Array]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isDate(obj) {
    return toStr(obj) === '[object Date]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isRegExp(obj) {
    return toStr(obj) === '[object RegExp]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isError(obj) {
    return toStr(obj) === '[object Error]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isString(obj) {
    return toStr(obj) === '[object String]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isNumber(obj) {
    return toStr(obj) === '[object Number]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}
function isBoolean(obj) {
    return toStr(obj) === '[object Boolean]' && (!toStringTag || !((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && toStringTag in obj));
}

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj instanceof Symbol;
    }
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'symbol') {
        return true;
    }
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) {
    return key in this;
};
function has(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) {
        return f.name;
    }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) {
        return m[1];
    }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) {
        return xs.indexOf(x);
    }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
            return i;
        }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') {
        return false;
    }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = $replace.call($replace.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) {
        return '\\' + x;
    }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) {
        return '';
    }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) {
        // eslint-disable-line no-restricted-syntax
        if (!has(obj, key)) {
            continue;
        } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
        } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
})();
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
    return [];
};

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

/***/ }),

/***/ "./node_modules/qs/lib/formats.js":
/*!****************************************!*\
  !*** ./node_modules/qs/lib/formats.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function RFC1738(value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function RFC3986(value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};

/***/ }),

/***/ "./node_modules/qs/lib/index.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stringify = __webpack_require__(/*! ./stringify */ "./node_modules/qs/lib/stringify.js");
var parse = __webpack_require__(/*! ./parse */ "./node_modules/qs/lib/parse.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

/***/ }),

/***/ "./node_modules/qs/lib/parse.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/parse.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function interpretNumericEntities(str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function parseArrayValue(val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options), function (encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, 'value');
            });
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObject(chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
                obj = [];
                obj[index] = leaf;
            } else if (cleanRoot !== '__proto__') {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};

/***/ }),

/***/ "./node_modules/qs/lib/stringify.js":
/*!******************************************!*\
  !*** ./node_modules/qs/lib/stringify.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var getSideChannel = __webpack_require__(/*! side-channel */ "./node_modules/side-channel/index.js");
var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var split = String.prototype.split;
var push = Array.prototype.push;
var pushToArray = function pushToArray(arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'symbol' || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            if (generateArrayPrefix === 'comma' && encodeValuesOnly) {
                var valuesArray = split.call(String(obj), ',');
                var valuesJoined = '';
                for (var i = 0; i < valuesArray.length; ++i) {
                    valuesJoined += (i === 0 ? '' : ',') + formatter(encoder(valuesArray[i], defaults.encoder, charset, 'value', format));
                }
                return [formatter(keyValue) + (isArray(obj) && valuesArray.length === 1 ? '[]' : '') + '=' + valuesJoined];
            }
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var adjustedPrefix = generateArrayPrefix === 'comma' && isArray(obj) && obj.length === 1 ? prefix + '[]' : prefix;

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix : adjustedPrefix + (allowDots ? '.' + key : '[' + key + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(obj[key], key, generateArrayPrefix, options.strictNullHandling, options.skipNulls, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

/***/ }),

/***/ "./node_modules/qs/lib/utils.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}();

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object') {
            if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && (typeof targetItem === 'undefined' ? 'undefined' : _typeof(targetItem)) === 'object' && item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function decode(str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if ((typeof str === 'undefined' ? 'undefined' : _typeof(str)) === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (c === 0x2D // -
        || c === 0x2E // .
        || c === 0x5F // _
        || c === 0x7E // ~
        || c >= 0x30 && c <= 0x39 // 0-9
        || c >= 0x41 && c <= 0x5A // a-z
        || c >= 0x61 && c <= 0x7A // A-Z
        || format === formats.RFC1738 && (c === 0x28 || c === 0x29) // ( )
        ) {
                out += string.charAt(i);
                continue;
            }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | c >> 6] + hexTable[0x80 | c & 0x3F]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | c >> 12] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F]);
            continue;
        }

        i += 1;
        c = 0x10000 + ((c & 0x3FF) << 10 | string.charCodeAt(i) & 0x3FF);
        /* eslint operator-linebreak: [2, "before"] */
        out += hexTable[0xF0 | c >> 18] + hexTable[0x80 | c >> 12 & 0x3F] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};

/***/ }),

/***/ "./node_modules/setimmediate/setImmediate.js":
/*!***************************************************!*\
  !*** ./node_modules/setimmediate/setImmediate.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
        // Callback can either be a function or a string
        if (typeof callback !== "function") {
            callback = new Function("" + callback);
        }
        // Copy function arguments
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1];
        }
        // Store and register the task
        var task = { callback: callback, args: args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
            case 0:
                callback();
                break;
            case 1:
                callback(args[0]);
                break;
            case 2:
                callback(args[0], args[1]);
                break;
            case 3:
                callback(args[0], args[1], args[2]);
                break;
            default:
                callback.apply(undefined, args);
                break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function registerImmediate(handle) {
            process.nextTick(function () {
                runIfPresent(handle);
            });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function onGlobalMessage(event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function registerImmediate(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function registerImmediate(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function registerImmediate(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function registerImmediate(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();
    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();
    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();
    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
})(typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/side-channel/index.js":
/*!********************************************!*\
  !*** ./node_modules/side-channel/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");
var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");
var inspect = __webpack_require__(/*! object-inspect */ "./node_modules/object-inspect/index.js");

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);

var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);

/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */
var listGetNode = function listGetNode(list, key) {
	// eslint-disable-line consistent-return
	for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr; // eslint-disable-line no-param-reassign
			return curr;
		}
	}
};

var listGet = function listGet(objects, key) {
	var node = listGetNode(objects, key);
	return node && node.value;
};
var listSet = function listSet(objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = { // eslint-disable-line no-param-reassign
			key: key,
			next: objects.next,
			value: value
		};
	}
};
var listHas = function listHas(objects, key) {
	return !!listGetNode(objects, key);
};

module.exports = function getSideChannel() {
	var $wm;
	var $m;
	var $o;
	var channel = {
		assert: function assert(key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		get: function get(key) {
			// eslint-disable-line consistent-return
			if ($WeakMap && key && ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapGet($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapGet($m, key);
				}
			} else {
				if ($o) {
					// eslint-disable-line no-lonely-if
					return listGet($o, key);
				}
			}
		},
		has: function has(key) {
			if ($WeakMap && key && ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapHas($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapHas($m, key);
				}
			} else {
				if ($o) {
					// eslint-disable-line no-lonely-if
					return listHas($o, key);
				}
			}
			return false;
		},
		set: function set(key, value) {
			if ($WeakMap && key && ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object' || typeof key === 'function')) {
				if (!$wm) {
					$wm = new $WeakMap();
				}
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				if (!$m) {
					$m = new $Map();
				}
				$mapSet($m, key, value);
			} else {
				if (!$o) {
					/*
      * Initialize the linked list as an empty node, so that we don't have
      * to special-case handling of the first node: we can always refer to
      * it as (previous node).next, instead of something like (list).head
      */
					$o = { key: {}, next: null };
				}
				listSet($o, key, value);
			}
		}
	};
	return channel;
};

/***/ }),

/***/ "./node_modules/superagent/lib/agent-base.js":
/*!***************************************************!*\
  !*** ./node_modules/superagent/lib/agent-base.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {
          if (i >= o.length) return { done: true };return { done: false, value: o[i++] };
        }, e: function e(_e) {
          throw _e;
        }, f: F };
    }throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }var normalCompletion = true,
      didErr = false,
      err;return { s: function s() {
      it = it.call(o);
    }, n: function n() {
      var step = it.next();normalCompletion = step.done;return step;
    }, e: function e(_e2) {
      didErr = true;err = _e2;
    }, f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }return arr2;
}

function Agent() {
  this._defaults = [];
}

var _loop = function _loop() {
  var fn = _arr[_i];

  // Default setting for all requests from this agent
  Agent.prototype[fn] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this._defaults.push({
      fn: fn,
      args: args
    });

    return this;
  };
};

for (var _i = 0, _arr = ['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts']; _i < _arr.length; _i++) {
  _loop();
}

Agent.prototype._setDefaults = function (request) {
  var _iterator = _createForOfIteratorHelper(this._defaults),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var def = _step.value;
      request[def.fn].apply(request, _toConsumableArray(def.args));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

module.exports = Agent;

/***/ }),

/***/ "./node_modules/superagent/lib/client.js":
/*!***********************************************!*\
  !*** ./node_modules/superagent/lib/client.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  }, _typeof(obj);
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {
          if (i >= o.length) return { done: true };return { done: false, value: o[i++] };
        }, e: function e(_e) {
          throw _e;
        }, f: F };
    }throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }var normalCompletion = true,
      didErr = false,
      err;return { s: function s() {
      it = it.call(o);
    }, n: function n() {
      var step = it.next();normalCompletion = step.done;return step;
    }, e: function e(_e2) {
      didErr = true;err = _e2;
    }, f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }return arr2;
}

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = __webpack_require__(/*! component-emitter */ "./node_modules/component-emitter/index.js");

var safeStringify = __webpack_require__(/*! fast-safe-stringify */ "./node_modules/fast-safe-stringify/index.js");

var qs = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");

var RequestBase = __webpack_require__(/*! ./request-base */ "./node_modules/superagent/lib/request-base.js");

var _require = __webpack_require__(/*! ./utils */ "./node_modules/superagent/lib/utils.js"),
    isObject = _require.isObject,
    mixin = _require.mixin,
    hasOwn = _require.hasOwn;

var ResponseBase = __webpack_require__(/*! ./response-base */ "./node_modules/superagent/lib/response-base.js");

var Agent = __webpack_require__(/*! ./agent-base */ "./node_modules/superagent/lib/agent-base.js");
/**
 * Noop.
 */

function noop() {}
/**
 * Expose `request`.
 */

module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:')) {
    return new XMLHttpRequest();
  }

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(object) {
  if (!isObject(object)) return object;
  var pairs = [];

  for (var key in object) {
    if (hasOwn(object, key)) pushEncodedKeyValuePair(pairs, key, object[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, value) {
  if (value === undefined) return;

  if (value === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(value)) {
    var _iterator = _createForOfIteratorHelper(value),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var v = _step.value;
        pushEncodedKeyValuePair(pairs, key, v);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else if (isObject(value)) {
    for (var subkey in value) {
      if (hasOwn(value, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(value));
  }
}
/**
 * Expose serialization method.
 */

request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(string_) {
  var object = {};
  var pairs = string_.split('&');
  var pair;
  var pos;

  for (var i = 0, length_ = pairs.length; i < length_; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      object[decodeURIComponent(pair)] = '';
    } else {
      object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return object;
}
/**
 * Expose parser.
 */

request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(string_) {
  var lines = string_.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var value;

  for (var i = 0, length_ = lines.length; i < length_; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    value = trim(line.slice(index + 1));
    fields[field] = value;
  }

  return fields;
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return (/[/+]json($|[^-\w])/i.test(mime)
  );
}
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(request_) {
  this.req = request_;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && request_._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
}

mixin(Response.prototype, ResponseBase.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (string_) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, string_);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var message = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var error = new Error(message);
  error.status = this.status;
  error.method = method;
  error.url = url;
  return error;
};
/**
 * Expose `Response`.
 */

request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', function () {
    var error = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (err) {
      error = new Error('Parser is unable to parse the response');
      error.parse = true;
      error.original = err; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        error.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        error.status = self.xhr.status ? self.xhr.status : null;
        error.statusCode = error.status; // backwards-compat only
      } else {
        error.rawResponse = null;
        error.status = null;
      }

      return self.callback(error);
    }

    self.emit('response', res);
    var new_error;

    try {
      if (!self._isResponseOK(res)) {
        new_error = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err) {
      new_error = err; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_error) {
      new_error.original = error;
      new_error.response = res;
      new_error.status = new_error.status || res.status;
      self.callback(new_error, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function (type) {
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = options.encoder ? options.encoder : function (string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };
  return this._auth(user, pass, options, encoder);
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function (value) {
  if (typeof value !== 'string') value = serialize(value);
  if (value) this._query.push(value);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (error) {
    if (this._maxRetries) error.retries = this._retries - 1;
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function () {
  var error = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  error.crossDomain = true;
  error.status = this.status;
  error.method = this.method;
  error.url = this.url;
  this.callback(error);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (object) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return object && _typeof(object) === 'object' && !Array.isArray(object) && Object.prototype.toString.call(object) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.addEventListener('readystatechange', function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }); // progress

  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused2) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (hasOwn(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

var _loop = function _loop() {
  var method = _arr[_i];

  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var request_ = new request.Request(method, url);

    this._setDefaults(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
};

for (var _i = 0, _arr = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE']; _i < _arr.length; _i++) {
  _loop();
}

Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var request_ = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function (url, data, fn) {
  var request_ = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function (url, data, fn) {
  var request_ = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn) {
  var request_ = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var request_ = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function (url, data, fn) {
  var request_ = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function (url, data, fn) {
  var request_ = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};

/***/ }),

/***/ "./node_modules/superagent/lib/request-base.js":
/*!*****************************************************!*\
  !*** ./node_modules/superagent/lib/request-base.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  }, _typeof(obj);
}

var semver = __webpack_require__(/*! semver */ 1);
/**
 * Module of mixed-in functions shared between node and client code
 */

var _require = __webpack_require__(/*! ./utils */ "./node_modules/superagent/lib/utils.js"),
    isObject = _require.isObject,
    hasOwn = _require.hasOwn;
/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;
/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase() {}
/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function () {
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  clearTimeout(this._uploadTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  delete this._uploadTimeoutTimer;
  return this;
};
/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function (fn) {
  this._parser = fn;
  return this;
};
/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function (value) {
  this._responseType = value;
  return this;
};
/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function (fn) {
  this._serializer = fn;
  return this;
};
/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function (options) {
  if (!options || _typeof(options) !== 'object') {
    this._timeout = options;
    this._responseTimeout = 0;
    this._uploadTimeout = 0;
    return this;
  }

  for (var option in options) {
    if (hasOwn(options, option)) {
      switch (option) {
        case 'deadline':
          this._timeout = options.deadline;
          break;

        case 'response':
          this._responseTimeout = options.response;
          break;

        case 'upload':
          this._uploadTimeout = options.upload;
          break;

        default:
          console.warn('Unknown timeout option', option);
      }
    }
  }

  return this;
};
/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function (count, fn) {
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
}; //
// NOTE: we do not include ESOCKETTIMEDOUT because that is from `request` package
//       <https://github.com/sindresorhus/got/pull/537>
//
// NOTE: we do not include EADDRINFO because it was removed from libuv in 2014
//       <https://github.com/libuv/libuv/commit/02e1ebd40b807be5af46343ea873331b2ee4e9c1>
//       <https://github.com/request/request/search?q=ESOCKETTIMEDOUT&unscoped_q=ESOCKETTIMEDOUT>
//
//
// TODO: expose these as configurable defaults
//


var ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']);
var STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]); // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)
// const METHODS = new Set(['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']);

/**
 * Determine if a request should be retried.
 * (Inspired by https://github.com/sindresorhus/got#retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (error, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      var override = this._retryCallback(error, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (err) {
      console.error(err);
    }
  } // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)

  /*
  if (
    this.req &&
    this.req.method &&
    !METHODS.has(this.req.method.toUpperCase())
  )
    return false;
  */

  if (res && res.status && STATUS_CODES.has(res.status)) return true;

  if (error) {
    if (error.code && ERROR_CODES.has(error.code)) return true; // Superagent timeout

    if (error.timeout && error.code === 'ECONNABORTED') return true;
    if (error.crossDomain) return true;
  }

  return false;
};
/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function () {
  this.clearTimeout(); // node

  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;
  this.timedoutError = null;
  return this._end();
};
/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function (resolve, reject) {
  var _this = this;

  if (!this._fullfilledPromise) {
    var self = this;

    if (this._endCalled) {
      console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
    }

    this._fullfilledPromise = new Promise(function (resolve, reject) {
      self.on('abort', function () {
        if (_this._maxRetries && _this._maxRetries > _this._retries) {
          return;
        }

        if (_this.timedout && _this.timedoutError) {
          reject(_this.timedoutError);
          return;
        }

        var error = new Error('Aborted');
        error.code = 'ABORTED';
        error.status = _this.status;
        error.method = _this.method;
        error.url = _this.url;
        reject(error);
      });
      self.end(function (error, res) {
        if (error) reject(error);else resolve(res);
      });
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function (callback) {
  return this.then(undefined, callback);
};
/**
 * Allow for extension
 */

RequestBase.prototype.use = function (fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function (callback) {
  if (typeof callback !== 'function') throw new Error('Callback required');
  this._okCallback = callback;
  return this;
};

RequestBase.prototype._isResponseOK = function (res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};
/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function (field) {
  return this._header[field.toLowerCase()];
};
/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;
/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function (field, value) {
  if (isObject(field)) {
    for (var key in field) {
      if (hasOwn(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = value;
  this.header[field] = value;
  return this;
};
/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field field name
 */

RequestBase.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};
/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name name of field
 * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
 * @param {String} options extra options, e.g. 'blob'
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.field = function (name, value, options) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      if (hasOwn(name, key)) this.field(key, name[key]);
    }

    return this;
  }

  if (Array.isArray(value)) {
    for (var i in value) {
      if (hasOwn(value, i)) this.field(name, value[i]);
    }

    return this;
  } // val should be defined now


  if (value === null || undefined === value) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof value === 'boolean') {
    value = String(value);
  } // fix https://github.com/visionmedia/superagent/issues/1680


  if (options) this._getFormData().append(name, value, options);else this._getFormData().append(name, value);
  return this;
};
/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request} request
 * @api public
 */

RequestBase.prototype.abort = function () {
  if (this._aborted) {
    return this;
  }

  this._aborted = true;
  if (this.xhr) this.xhr.abort(); // browser

  if (this.req) {
    // Node v13 has major differences in `abort()`
    // https://github.com/nodejs/node/blob/v12.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v13.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v14.x/lib/internal/streams/end-of-stream.js
    // (if you run a diff across these you will see the differences)
    //
    // References:
    // <https://github.com/nodejs/node/issues/31630>
    // <https://github.com/visionmedia/superagent/pull/1084/commits/dc18679a7c5ccfc6046d882015e5126888973bc8>
    //
    // Thanks to @shadowgate15 and @niftylettuce
    if (semver.gte(process.version, 'v13.0.0') && semver.lt(process.version, 'v14.0.0')) {
      // Note that the reason this doesn't work is because in v13 as compared to v14
      // there is no `callback = nop` set in end-of-stream.js above
      throw new Error('Superagent does not work in v13 properly with abort() due to Node.js core changes');
    } else if (semver.gte(process.version, 'v14.0.0')) {
      // We have to manually set `destroyed` to `true` in order for this to work
      // (see core internals of end-of-stream.js above in v14 branch as compared to v12)
      this.req.destroyed = true;
    }

    this.req.abort(); // node
  }

  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer':
      // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', "Bearer ".concat(user));
      break;

    default:
      break;
  }

  return this;
};
/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function (on) {
  // This is browser-only functionality. Node side is no-op.
  if (on === undefined) on = true;
  this._withCredentials = on;
  return this;
};
/**
 * Set the max redirects to `n`. Does nothing in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function (n) {
  this._maxRedirects = n;
  return this;
};
/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n number of bytes
 * @return {Request} for chaining
 */

RequestBase.prototype.maxResponseSize = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Invalid argument');
  }

  this._maxResponseSize = n;
  return this;
};
/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function () {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};
/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */
// eslint-disable-next-line complexity


RequestBase.prototype.send = function (data) {
  var isObject_ = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject_ && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObject_ && isObject(this._data)) {
    for (var key in data) {
      if (hasOwn(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if (type) type = type.toLowerCase().trim();

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObject_ || this._isHost(data)) {
    return this;
  } // default to json


  if (!type) this.type('json');
  return this;
};
/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function (sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};
/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

RequestBase.prototype._finalizeQueryString = function () {
  var query = this._query.join('&');

  if (query) {
    this.url += (this.url.includes('?') ? '&' : '?') + query;
  }

  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    var index = this.url.indexOf('?');

    if (index >= 0) {
      var queryArray = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArray.sort(this._sort);
      } else {
        queryArray.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArray.join('&');
    }
  }
}; // For backwards compat only


RequestBase.prototype._appendQueryString = function () {
  console.warn('Unsupported');
};
/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
  if (this._aborted) {
    return;
  }

  var error = new Error("".concat(reason + timeout, "ms exceeded"));
  error.timeout = timeout;
  error.code = 'ECONNABORTED';
  error.errno = errno;
  this.timedout = true;
  this.timedoutError = error;
  this.abort();
  this.callback(error);
};

RequestBase.prototype._setTimeouts = function () {
  var self = this; // deadline

  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function () {
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  } // response timeout


  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function () {
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/superagent/lib/response-base.js":
/*!******************************************************!*\
  !*** ./node_modules/superagent/lib/response-base.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var utils = __webpack_require__(/*! ./utils */ "./node_modules/superagent/lib/utils.js");
/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;
/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase() {}
/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function (field) {
  return this.header[field.toLowerCase()];
};
/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function (header) {
  // TODO: moar!
  // TODO: make this a util
  // content-type
  var ct = header['content-type'] || '';
  this.type = utils.type(ct); // params

  var parameters = utils.params(ct);

  for (var key in parameters) {
    if (Object.prototype.hasOwnProperty.call(parameters, key)) this[key] = parameters[key];
  }

  this.links = {}; // links

  try {
    if (header.link) {
      this.links = utils.parseLinks(header.link);
    }
  } catch (_unused) {// ignore
  }
};
/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function (status) {
  var type = Math.trunc(status / 100); // status / class

  this.statusCode = status;
  this.status = this.statusCode;
  this.statusType = type; // basics

  this.info = type === 1;
  this.ok = type === 2;
  this.redirect = type === 3;
  this.clientError = type === 4;
  this.serverError = type === 5;
  this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

  this.created = status === 201;
  this.accepted = status === 202;
  this.noContent = status === 204;
  this.badRequest = status === 400;
  this.unauthorized = status === 401;
  this.notAcceptable = status === 406;
  this.forbidden = status === 403;
  this.notFound = status === 404;
  this.unprocessableEntity = status === 422;
};

/***/ }),

/***/ "./node_modules/superagent/lib/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/superagent/lib/utils.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
  }, _typeof(obj);
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {
          if (i >= o.length) return { done: true };return { done: false, value: o[i++] };
        }, e: function e(_e) {
          throw _e;
        }, f: F };
    }throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }var normalCompletion = true,
      didErr = false,
      err;return { s: function s() {
      it = it.call(o);
    }, n: function n() {
      var step = it.next();normalCompletion = step.done;return step;
    }, e: function e(_e2) {
      didErr = true;err = _e2;
    }, f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }return arr2;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = function (string_) {
  return string_.split(/ *; */).shift();
};
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function (value) {
  var object = {};

  var _iterator = _createForOfIteratorHelper(value.split(/ *; */)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var string_ = _step.value;
      var parts = string_.split(/ *= */);
      var key = parts.shift();

      var _value = parts.shift();

      if (key && _value) object[key] = _value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return object;
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function (value) {
  var object = {};

  var _iterator2 = _createForOfIteratorHelper(value.split(/ *, */)),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var string_ = _step2.value;
      var parts = string_.split(/ *; */);
      var url = parts[0].slice(1, -1);
      var rel = parts[1].split(/ *= */)[1].slice(1, -1);
      object[rel] = url;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return object;
};
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function (header, changesOrigin) {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};
/**
 * Check if `obj` is an object.
 *
 * @param {Object} object
 * @return {Boolean}
 * @api private
 */

exports.isObject = function (object) {
  return object !== null && _typeof(object) === 'object';
};
/**
 * Object.hasOwn fallback/polyfill.
 *
 * @type {(object: object, property: string) => boolean} object
 * @api private
 */

exports.hasOwn = Object.hasOwn || function (object, property) {
  if (object == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  return Object.prototype.hasOwnProperty.call(new Object(object), property);
};

exports.mixin = function (target, source) {
  for (var key in source) {
    if (exports.hasOwn(source, key)) {
      target[key] = source[key];
    }
  }
};

/***/ }),

/***/ "./node_modules/timers-browserify/main.js":
/*!************************************************!*\
  !*** ./node_modules/timers-browserify/main.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var scope = typeof global !== "undefined" && global || typeof self !== "undefined" && self || window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function () {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function () {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout = exports.clearInterval = function (timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function () {};
Timeout.prototype.close = function () {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function (item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function (item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function (item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout) item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(/*! setimmediate */ "./node_modules/setimmediate/setImmediate.js");
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = typeof self !== "undefined" && self.setImmediate || typeof global !== "undefined" && global.setImmediate || undefined && undefined.setImmediate;
exports.clearImmediate = typeof self !== "undefined" && self.clearImmediate || typeof global !== "undefined" && global.clearImmediate || undefined && undefined.clearImmediate;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),

/***/ 0:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 1:
/*!************************!*\
  !*** semver (ignored) ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9QYXRoTG9hZGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9pbmRleC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbGliL2xvYWRlcnMvZmlsZS1icm93c2VyLmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9saWIvbG9hZGVycy9odHRwLmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvY2FsbC1iaW5kL2NhbGxCb3VuZC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL2NhbGwtYmluZC9pbmRleC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvZmFzdC1zYWZlLXN0cmluZ2lmeS9pbmRleC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL2Z1bmN0aW9uLWJpbmQvaW1wbGVtZW50YXRpb24uanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL25vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2luZGV4LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvZ2V0LWludHJpbnNpYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL2hhcy1zeW1ib2xzL2luZGV4LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvaGFzLXN5bWJvbHMvc2hhbXMuanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL25vZGVfbW9kdWxlcy9oYXMvc3JjL2luZGV4LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvbmF0aXZlLXByb21pc2Utb25seS9saWIvbnBvLnNyYy5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L2luZGV4LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvcXMvbGliL2Zvcm1hdHMuanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL25vZGVfbW9kdWxlcy9xcy9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL25vZGVfbW9kdWxlcy9xcy9saWIvcGFyc2UuanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL25vZGVfbW9kdWxlcy9xcy9saWIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvcXMvbGliL3V0aWxzLmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi9ub2RlX21vZHVsZXMvc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL3NpZGUtY2hhbm5lbC9pbmRleC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4uL3NyYy9hZ2VudC1iYXNlLmpzIiwid2VicGFjazovL1BhdGhMb2FkZXIvLi4vc3JjL2NsaWVudC5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4uL3NyYy9yZXF1ZXN0LWJhc2UuanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uLi9zcmMvcmVzcG9uc2UtYmFzZS5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly9QYXRoTG9hZGVyLy4vbm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci8uL3V0aWwuaW5zcGVjdCAoaWdub3JlZCkiLCJ3ZWJwYWNrOi8vUGF0aExvYWRlci9zZW12ZXIgKGlnbm9yZWQpIl0sIm5hbWVzIjpbInN1cHBvcnRlZExvYWRlcnMiLCJmaWxlIiwicmVxdWlyZSIsImh0dHAiLCJodHRwcyIsImRlZmF1bHRMb2FkZXIiLCJ3aW5kb3ciLCJpbXBvcnRTY3JpcHRzIiwiUHJvbWlzZSIsImdldFNjaGVtZSIsImxvY2F0aW9uIiwiaW5kZXhPZiIsInNwbGl0IiwiZ2V0TG9hZGVyIiwic2NoZW1lIiwibG9hZGVyIiwiRXJyb3IiLCJtb2R1bGUiLCJleHBvcnRzIiwibG9hZCIsIm9wdGlvbnMiLCJhbGxUYXNrcyIsInJlc29sdmUiLCJ0aGVuIiwiVHlwZUVycm9yIiwicHJvY2Vzc0NvbnRlbnQiLCJyZWplY3QiLCJlcnIiLCJkb2N1bWVudCIsInJlcyIsInRleHQiLCJwcm9jZXNzZWQiLCJ1bnN1cHBvcnRlZEVycm9yIiwiZ2V0QmFzZSIsImZuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicmVxdWVzdCIsInN1cHBvcnRlZEh0dHBNZXRob2RzIiwiY2FsbGJhY2siLCJyZWFsTWV0aG9kIiwibWV0aG9kIiwidG9Mb3dlckNhc2UiLCJyZWFsUmVxdWVzdCIsIm1ha2VSZXF1ZXN0IiwicmVxIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwicHJvY2VzcyIsImJ1ZmZlciIsImVuZCIsImVycjIiLCJ1bmRlZmluZWQiLCJzbGljZSIsImpvaW4iLCJwcmVwYXJlUmVxdWVzdCIsIkdldEludHJpbnNpYyIsImNhbGxCaW5kIiwiJGluZGV4T2YiLCJjYWxsQm91bmRJbnRyaW5zaWMiLCJuYW1lIiwiYWxsb3dNaXNzaW5nIiwiaW50cmluc2ljIiwiYmluZCIsIiRhcHBseSIsIiRjYWxsIiwiJHJlZmxlY3RBcHBseSIsIiRnT1BEIiwiJGRlZmluZVByb3BlcnR5IiwiJG1heCIsInZhbHVlIiwiZSIsIm9yaWdpbmFsRnVuY3Rpb24iLCJmdW5jIiwiZGVzYyIsImNvbmZpZ3VyYWJsZSIsImFwcGx5QmluZCIsImFwcGx5IiwiRW1pdHRlciIsIm9iaiIsIm1peGluIiwia2V5Iiwib24iLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJfY2FsbGJhY2tzIiwicHVzaCIsIm9uY2UiLCJvZmYiLCJyZW1vdmVMaXN0ZW5lciIsInJlbW92ZUFsbExpc3RlbmVycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjYWxsYmFja3MiLCJjYiIsImkiLCJzcGxpY2UiLCJlbWl0IiwiYXJncyIsIkFycmF5IiwibGVuIiwibGlzdGVuZXJzIiwiaGFzTGlzdGVuZXJzIiwic3RyaW5naWZ5IiwiZGVmYXVsdCIsInN0YWJsZSIsImRldGVybWluaXN0aWNTdHJpbmdpZnkiLCJzdGFibGVTdHJpbmdpZnkiLCJMSU1JVF9SRVBMQUNFX05PREUiLCJDSVJDVUxBUl9SRVBMQUNFX05PREUiLCJhcnIiLCJyZXBsYWNlclN0YWNrIiwiZGVmYXVsdE9wdGlvbnMiLCJkZXB0aExpbWl0IiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsImVkZ2VzTGltaXQiLCJyZXBsYWNlciIsInNwYWNlciIsImRlY2lyYyIsIkpTT04iLCJyZXBsYWNlR2V0dGVyVmFsdWVzIiwiXyIsInBhcnQiLCJwb3AiLCJkZWZpbmVQcm9wZXJ0eSIsInNldFJlcGxhY2UiLCJyZXBsYWNlIiwidmFsIiwiayIsInBhcmVudCIsInByb3BlcnR5RGVzY3JpcHRvciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImdldCIsImVkZ2VJbmRleCIsInN0YWNrIiwiZGVwdGgiLCJpc0FycmF5Iiwia2V5cyIsImNvbXBhcmVGdW5jdGlvbiIsImEiLCJiIiwidG1wIiwiZGV0ZXJtaW5pc3RpY0RlY2lyYyIsInRvSlNPTiIsInNvcnQiLCJ2IiwiRVJST1JfTUVTU0FHRSIsInRvU3RyIiwiZnVuY1R5cGUiLCJ0aGF0IiwidGFyZ2V0IiwiYm91bmQiLCJiaW5kZXIiLCJyZXN1bHQiLCJjb25jYXQiLCJib3VuZExlbmd0aCIsIk1hdGgiLCJtYXgiLCJib3VuZEFyZ3MiLCJGdW5jdGlvbiIsIkVtcHR5IiwiaW1wbGVtZW50YXRpb24iLCIkU3ludGF4RXJyb3IiLCJTeW50YXhFcnJvciIsIiRGdW5jdGlvbiIsIiRUeXBlRXJyb3IiLCJnZXRFdmFsbGVkQ29uc3RydWN0b3IiLCJleHByZXNzaW9uU3ludGF4IiwidGhyb3dUeXBlRXJyb3IiLCJUaHJvd1R5cGVFcnJvciIsImNhbGxlZSIsImNhbGxlZVRocm93cyIsImdPUER0aHJvd3MiLCJoYXNTeW1ib2xzIiwiZ2V0UHJvdG8iLCJnZXRQcm90b3R5cGVPZiIsIngiLCJfX3Byb3RvX18iLCJuZWVkc0V2YWwiLCJUeXBlZEFycmF5IiwiVWludDhBcnJheSIsIklOVFJJTlNJQ1MiLCJBZ2dyZWdhdGVFcnJvciIsIkFycmF5QnVmZmVyIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJBdG9taWNzIiwiQmlnSW50IiwiQm9vbGVhbiIsIkRhdGFWaWV3IiwiRGF0ZSIsImRlY29kZVVSSSIsImRlY29kZVVSSUNvbXBvbmVudCIsImVuY29kZVVSSSIsImVuY29kZVVSSUNvbXBvbmVudCIsImV2YWwiLCJFdmFsRXJyb3IiLCJGbG9hdDMyQXJyYXkiLCJGbG9hdDY0QXJyYXkiLCJGaW5hbGl6YXRpb25SZWdpc3RyeSIsIkludDhBcnJheSIsIkludDE2QXJyYXkiLCJJbnQzMkFycmF5IiwiaXNGaW5pdGUiLCJpc05hTiIsIk1hcCIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsIlByb3h5IiwiUmFuZ2VFcnJvciIsIlJlZmVyZW5jZUVycm9yIiwiUmVmbGVjdCIsIlJlZ0V4cCIsIlNldCIsIlNoYXJlZEFycmF5QnVmZmVyIiwiU3RyaW5nIiwiVWludDhDbGFtcGVkQXJyYXkiLCJVaW50MTZBcnJheSIsIlVpbnQzMkFycmF5IiwiVVJJRXJyb3IiLCJXZWFrTWFwIiwiV2Vha1JlZiIsIldlYWtTZXQiLCJkb0V2YWwiLCJnZW4iLCJMRUdBQ1lfQUxJQVNFUyIsImhhc093biIsIiRjb25jYXQiLCIkc3BsaWNlQXBwbHkiLCIkcmVwbGFjZSIsIiRzdHJTbGljZSIsIiRleGVjIiwiZXhlYyIsInJlUHJvcE5hbWUiLCJyZUVzY2FwZUNoYXIiLCJzdHJpbmdUb1BhdGgiLCJzdHJpbmciLCJmaXJzdCIsImxhc3QiLCJtYXRjaCIsIm51bWJlciIsInF1b3RlIiwic3ViU3RyaW5nIiwiZ2V0QmFzZUludHJpbnNpYyIsImludHJpbnNpY05hbWUiLCJhbGlhcyIsInBhcnRzIiwiaW50cmluc2ljQmFzZU5hbWUiLCJpbnRyaW5zaWNSZWFsTmFtZSIsInNraXBGdXJ0aGVyQ2FjaGluZyIsImlzT3duIiwib3JpZ1N5bWJvbCIsImhhc1N5bWJvbFNoYW0iLCJoYXNOYXRpdmVTeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwic3ltIiwic3ltT2JqIiwic3ltVmFsIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInN5bXMiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsImRlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwiaGFzT3duUHJvcGVydHkiLCJVTUQiLCJjb250ZXh0IiwiZGVmaW5pdGlvbiIsImRlZmluZSIsIiRBTUQkIiwiZ2xvYmFsIiwiREVGIiwiYnVpbHRJblByb3AiLCJjeWNsZSIsInNjaGVkdWxpbmdfcXVldWUiLCJUb1N0cmluZyIsInRpbWVyIiwic2V0SW1tZWRpYXRlIiwic2V0VGltZW91dCIsImNvbmZpZyIsIndyaXRhYmxlIiwiUXVldWUiLCJpdGVtIiwiSXRlbSIsInNlbGYiLCJuZXh0IiwiYWRkIiwiZHJhaW4iLCJmIiwic2NoZWR1bGUiLCJpc1RoZW5hYmxlIiwibyIsIl90aGVuIiwib190eXBlIiwibm90aWZ5IiwiY2hhaW4iLCJub3RpZnlJc29sYXRlZCIsInN0YXRlIiwic3VjY2VzcyIsImZhaWx1cmUiLCJyZXQiLCJtc2ciLCJwcm9taXNlIiwidHJpZ2dlcmVkIiwiZGVmIiwiZGVmX3dyYXBwZXIiLCJNYWtlRGVmV3JhcHBlciIsIiRyZXNvbHZlJCIsIiRyZWplY3QkIiwiaXRlcmF0ZVByb21pc2VzIiwiQ29uc3RydWN0b3IiLCJyZXNvbHZlciIsInJlamVjdGVyIiwiaWR4IiwiSUlGRSIsIiRyZXNvbHZlciQiLCJNYWtlRGVmIiwiZXhlY3V0b3IiLCJfX05QT19fIiwiY29uc3RydWN0b3IiLCJleHRyYWN0Q2hhaW4iLCIkY2F0Y2gkIiwicHVibGljUmVzb2x2ZSIsInB1YmxpY1JlamVjdCIsIlByb21pc2VQcm90b3R5cGUiLCJQcm9taXNlJHJlc29sdmUiLCJQcm9taXNlJHJlamVjdCIsIlByb21pc2UkYWxsIiwibXNncyIsImNvdW50IiwiUHJvbWlzZSRyYWNlIiwiaGFzTWFwIiwibWFwU2l6ZURlc2NyaXB0b3IiLCJtYXBTaXplIiwibWFwRm9yRWFjaCIsImZvckVhY2giLCJoYXNTZXQiLCJzZXRTaXplRGVzY3JpcHRvciIsInNldFNpemUiLCJzZXRGb3JFYWNoIiwiaGFzV2Vha01hcCIsIndlYWtNYXBIYXMiLCJoYXMiLCJoYXNXZWFrU2V0Iiwid2Vha1NldEhhcyIsImhhc1dlYWtSZWYiLCJ3ZWFrUmVmRGVyZWYiLCJkZXJlZiIsImJvb2xlYW5WYWx1ZU9mIiwidmFsdWVPZiIsIm9iamVjdFRvU3RyaW5nIiwiZnVuY3Rpb25Ub1N0cmluZyIsIiRtYXRjaCIsIiRzbGljZSIsIiR0b1VwcGVyQ2FzZSIsInRvVXBwZXJDYXNlIiwiJHRvTG93ZXJDYXNlIiwiJHRlc3QiLCJ0ZXN0IiwiJGpvaW4iLCIkYXJyU2xpY2UiLCIkZmxvb3IiLCJmbG9vciIsImJpZ0ludFZhbHVlT2YiLCJnT1BTIiwic3ltVG9TdHJpbmciLCJoYXNTaGFtbWVkU3ltYm9scyIsInRvU3RyaW5nVGFnIiwiaXNFbnVtZXJhYmxlIiwiZ1BPIiwiTyIsImFkZE51bWVyaWNTZXBhcmF0b3IiLCJudW0iLCJzdHIiLCJJbmZpbml0eSIsInNlcFJlZ2V4IiwiaW50IiwiaW50U3RyIiwiZGVjIiwidXRpbEluc3BlY3QiLCJpbnNwZWN0Q3VzdG9tIiwiY3VzdG9tIiwiaW5zcGVjdFN5bWJvbCIsImlzU3ltYm9sIiwiaW5zcGVjdF8iLCJzZWVuIiwib3B0cyIsInF1b3RlU3R5bGUiLCJtYXhTdHJpbmdMZW5ndGgiLCJjdXN0b21JbnNwZWN0IiwiaW5kZW50IiwibnVtZXJpY1NlcGFyYXRvciIsImluc3BlY3RTdHJpbmciLCJiaWdJbnRTdHIiLCJtYXhEZXB0aCIsImdldEluZGVudCIsImluc3BlY3QiLCJmcm9tIiwibm9JbmRlbnQiLCJuZXdPcHRzIiwiaXNSZWdFeHAiLCJuYW1lT2YiLCJhcnJPYmpLZXlzIiwic3ltU3RyaW5nIiwibWFya0JveGVkIiwiaXNFbGVtZW50IiwicyIsIm5vZGVOYW1lIiwiYXR0cnMiLCJhdHRyaWJ1dGVzIiwid3JhcFF1b3RlcyIsImNoaWxkTm9kZXMiLCJ4cyIsInNpbmdsZUxpbmVWYWx1ZXMiLCJpbmRlbnRlZEpvaW4iLCJpc0Vycm9yIiwiY2F1c2UiLCJpc01hcCIsIm1hcFBhcnRzIiwiY29sbGVjdGlvbk9mIiwiaXNTZXQiLCJzZXRQYXJ0cyIsImlzV2Vha01hcCIsIndlYWtDb2xsZWN0aW9uT2YiLCJpc1dlYWtTZXQiLCJpc1dlYWtSZWYiLCJpc051bWJlciIsImlzQmlnSW50IiwiaXNCb29sZWFuIiwiaXNTdHJpbmciLCJpc0RhdGUiLCJ5cyIsImlzUGxhaW5PYmplY3QiLCJwcm90b1RhZyIsInN0cmluZ1RhZyIsImNvbnN0cnVjdG9yVGFnIiwidGFnIiwiZGVmYXVsdFN0eWxlIiwicXVvdGVDaGFyIiwibSIsImwiLCJIVE1MRWxlbWVudCIsImdldEF0dHJpYnV0ZSIsInJlbWFpbmluZyIsInRyYWlsZXIiLCJsb3dieXRlIiwiYyIsIm4iLCJjaGFyQ29kZUF0IiwidHlwZSIsInNpemUiLCJlbnRyaWVzIiwiam9pbmVkRW50cmllcyIsImJhc2VJbmRlbnQiLCJiYXNlIiwicHJldiIsImxpbmVKb2luZXIiLCJpc0FyciIsInN5bU1hcCIsImoiLCJjYWNoZWRTZXRUaW1lb3V0IiwiY2FjaGVkQ2xlYXJUaW1lb3V0IiwiZGVmYXVsdFNldFRpbW91dCIsImRlZmF1bHRDbGVhclRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJydW5UaW1lb3V0IiwiZnVuIiwicnVuQ2xlYXJUaW1lb3V0IiwibWFya2VyIiwicXVldWUiLCJkcmFpbmluZyIsImN1cnJlbnRRdWV1ZSIsInF1ZXVlSW5kZXgiLCJjbGVhblVwTmV4dFRpY2siLCJkcmFpblF1ZXVlIiwidGltZW91dCIsInJ1biIsIm5leHRUaWNrIiwiYXJyYXkiLCJ0aXRsZSIsImJyb3dzZXIiLCJlbnYiLCJhcmd2IiwidmVyc2lvbiIsInZlcnNpb25zIiwibm9vcCIsImFkZExpc3RlbmVyIiwicHJlcGVuZExpc3RlbmVyIiwicHJlcGVuZE9uY2VMaXN0ZW5lciIsImJpbmRpbmciLCJjd2QiLCJjaGRpciIsImRpciIsInVtYXNrIiwicGVyY2VudFR3ZW50aWVzIiwiRm9ybWF0IiwiUkZDMTczOCIsIlJGQzM5ODYiLCJmb3JtYXR0ZXJzIiwicGFyc2UiLCJmb3JtYXRzIiwidXRpbHMiLCJkZWZhdWx0cyIsImFsbG93RG90cyIsImFsbG93UHJvdG90eXBlcyIsImFsbG93U3BhcnNlIiwiYXJyYXlMaW1pdCIsImNoYXJzZXQiLCJjaGFyc2V0U2VudGluZWwiLCJjb21tYSIsImRlY29kZXIiLCJkZWNvZGUiLCJkZWxpbWl0ZXIiLCJpZ25vcmVRdWVyeVByZWZpeCIsImludGVycHJldE51bWVyaWNFbnRpdGllcyIsInBhcmFtZXRlckxpbWl0IiwicGFyc2VBcnJheXMiLCJwbGFpbk9iamVjdHMiLCJzdHJpY3ROdWxsSGFuZGxpbmciLCIkMCIsIm51bWJlclN0ciIsImZyb21DaGFyQ29kZSIsInBhcnNlQXJyYXlWYWx1ZSIsImlzb1NlbnRpbmVsIiwicGFyc2VWYWx1ZXMiLCJwYXJzZVF1ZXJ5U3RyaW5nVmFsdWVzIiwiY2xlYW5TdHIiLCJsaW1pdCIsInNraXBJbmRleCIsImJyYWNrZXRFcXVhbHNQb3MiLCJwb3MiLCJtYXliZU1hcCIsImVuY29kZWRWYWwiLCJjb21iaW5lIiwicGFyc2VPYmplY3QiLCJ2YWx1ZXNQYXJzZWQiLCJsZWFmIiwicm9vdCIsImNyZWF0ZSIsImNsZWFuUm9vdCIsImNoYXJBdCIsImluZGV4IiwicGFyc2VLZXlzIiwicGFyc2VRdWVyeVN0cmluZ0tleXMiLCJnaXZlbktleSIsImJyYWNrZXRzIiwiY2hpbGQiLCJzZWdtZW50Iiwibm9ybWFsaXplUGFyc2VPcHRpb25zIiwidGVtcE9iaiIsIm5ld09iaiIsIm1lcmdlIiwiY29tcGFjdCIsImdldFNpZGVDaGFubmVsIiwiYXJyYXlQcmVmaXhHZW5lcmF0b3JzIiwicHJlZml4IiwiaW5kaWNlcyIsInJlcGVhdCIsInB1c2hUb0FycmF5IiwidmFsdWVPckFycmF5IiwidG9JU08iLCJ0b0lTT1N0cmluZyIsImRlZmF1bHRGb3JtYXQiLCJhZGRRdWVyeVByZWZpeCIsImVuY29kZSIsImVuY29kZXIiLCJlbmNvZGVWYWx1ZXNPbmx5IiwiZm9ybWF0IiwiZm9ybWF0dGVyIiwic2VyaWFsaXplRGF0ZSIsImRhdGUiLCJza2lwTnVsbHMiLCJpc05vbk51bGxpc2hQcmltaXRpdmUiLCJzZW50aW5lbCIsIm9iamVjdCIsImdlbmVyYXRlQXJyYXlQcmVmaXgiLCJmaWx0ZXIiLCJzaWRlQ2hhbm5lbCIsInRtcFNjIiwic3RlcCIsImZpbmRGbGFnIiwiaXNCdWZmZXIiLCJrZXlWYWx1ZSIsInZhbHVlc0FycmF5IiwidmFsdWVzSm9pbmVkIiwidmFsdWVzIiwib2JqS2V5cyIsImFkanVzdGVkUHJlZml4Iiwia2V5UHJlZml4Iiwic2V0IiwidmFsdWVTaWRlQ2hhbm5lbCIsIm5vcm1hbGl6ZVN0cmluZ2lmeU9wdGlvbnMiLCJhcnJheUZvcm1hdCIsImpvaW5lZCIsImhleFRhYmxlIiwiY29tcGFjdFF1ZXVlIiwicHJvcCIsImNvbXBhY3RlZCIsImFycmF5VG9PYmplY3QiLCJzb3VyY2UiLCJtZXJnZVRhcmdldCIsInRhcmdldEl0ZW0iLCJyZWR1Y2UiLCJhY2MiLCJhc3NpZ24iLCJhc3NpZ25TaW5nbGVTb3VyY2UiLCJzdHJXaXRob3V0UGx1cyIsInVuZXNjYXBlIiwiZGVmYXVsdEVuY29kZXIiLCJraW5kIiwiZXNjYXBlIiwib3V0IiwicmVmcyIsIm1hcHBlZCIsIm5leHRIYW5kbGUiLCJ0YXNrc0J5SGFuZGxlIiwiY3VycmVudGx5UnVubmluZ0FUYXNrIiwiZG9jIiwicmVnaXN0ZXJJbW1lZGlhdGUiLCJ0YXNrIiwiY2xlYXJJbW1lZGlhdGUiLCJoYW5kbGUiLCJydW5JZlByZXNlbnQiLCJpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbiIsImNhblVzZVBvc3RNZXNzYWdlIiwicG9zdE1lc3NhZ2UiLCJwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzIiwib2xkT25NZXNzYWdlIiwib25tZXNzYWdlIiwiaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24iLCJtZXNzYWdlUHJlZml4IiwicmFuZG9tIiwib25HbG9iYWxNZXNzYWdlIiwiZGF0YSIsImF0dGFjaEV2ZW50IiwiaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24iLCJjaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJwb3J0MSIsInBvcnQyIiwiaW5zdGFsbFJlYWR5U3RhdGVDaGFuZ2VJbXBsZW1lbnRhdGlvbiIsImh0bWwiLCJkb2N1bWVudEVsZW1lbnQiLCJzY3JpcHQiLCJjcmVhdGVFbGVtZW50Iiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVtb3ZlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsImluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24iLCJhdHRhY2hUbyIsImNhbGxCb3VuZCIsIiRXZWFrTWFwIiwiJE1hcCIsIiR3ZWFrTWFwR2V0IiwiJHdlYWtNYXBTZXQiLCIkd2Vha01hcEhhcyIsIiRtYXBHZXQiLCIkbWFwU2V0IiwiJG1hcEhhcyIsImxpc3RHZXROb2RlIiwibGlzdCIsImN1cnIiLCJsaXN0R2V0Iiwib2JqZWN0cyIsIm5vZGUiLCJsaXN0U2V0IiwibGlzdEhhcyIsIiR3bSIsIiRtIiwiJG8iLCJhc3NlcnQiLCJBZ2VudCIsImNvbnNvbGUiLCJzYWZlU3RyaW5naWZ5IiwicXMiLCJSZXF1ZXN0QmFzZSIsIlJlc3BvbnNlQmFzZSIsInRyaW0iLCJpc09iamVjdCIsInBhaXJzIiwicHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIiLCJzdHJpbmdfIiwibGVuZ3RoXyIsInBhaXIiLCJqc29uIiwieG1sIiwidXJsZW5jb2RlZCIsImZvcm0iLCJsaW5lcyIsImZpZWxkcyIsImxpbmUiLCJmaWVsZCIsInN0YXR1cyIsInBhcnNlSGVhZGVyIiwicmVxdWVzdF8iLCJSZXNwb25zZSIsImlzSlNPTiIsIm1lc3NhZ2UiLCJlcnJvciIsIm5ld19lcnJvciIsIlJlcXVlc3QiLCJwYXNzIiwiYnRvYSIsInNlcmlhbGl6ZSIsInhociIsInJlYWR5U3RhdGUiLCJoYW5kbGVQcm9ncmVzcyIsImNvbnRlbnRUeXBlIiwic2VtdmVyIiwiRVJST1JfQ09ERVMiLCJTVEFUVVNfQ09ERVMiLCJvdmVycmlkZSIsImJhc2U2NEVuY29kZXIiLCJ1cmwiLCJoZWFkZXJzIiwiX2hlYWRlciIsImlzT2JqZWN0XyIsInF1ZXJ5IiwicXVlcnlBcnJheSIsInJlYXNvbiIsImN0IiwiaGVhZGVyIiwicGFyYW1ldGVycyIsInJlbCIsInNjb3BlIiwiVGltZW91dCIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsImNsb3NlIiwiaWQiLCJjbGVhckZuIiwiX2lkIiwiX2NsZWFyRm4iLCJ1bnJlZiIsInJlZiIsImVucm9sbCIsIm1zZWNzIiwiX2lkbGVUaW1lb3V0SWQiLCJfaWRsZVRpbWVvdXQiLCJ1bmVucm9sbCIsIl91bnJlZkFjdGl2ZSIsImFjdGl2ZSIsIm9uVGltZW91dCIsIl9vblRpbWVvdXQiLCJnIl0sIm1hcHBpbmdzIjoiOztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FB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b250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vaW5kZXguanNcIik7XG4iLCIvKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEplcmVteSBXaGl0bG9ja1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VwcG9ydGVkTG9hZGVycyA9IHtcbiAgZmlsZTogcmVxdWlyZSgnLi9saWIvbG9hZGVycy9maWxlJyksXG4gIGh0dHA6IHJlcXVpcmUoJy4vbGliL2xvYWRlcnMvaHR0cCcpLFxuICBodHRwczogcmVxdWlyZSgnLi9saWIvbG9hZGVycy9odHRwJylcbn07XG52YXIgZGVmYXVsdExvYWRlciA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBpbXBvcnRTY3JpcHRzID09PSAnZnVuY3Rpb24nID9cbiAgICAgIHN1cHBvcnRlZExvYWRlcnMuaHR0cCA6XG4gICAgICBzdXBwb3J0ZWRMb2FkZXJzLmZpbGU7XG5cbi8vIExvYWQgcHJvbWlzZXMgcG9seWZpbGwgaWYgbmVjZXNzYXJ5XG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICh0eXBlb2YgUHJvbWlzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgcmVxdWlyZSgnbmF0aXZlLXByb21pc2Utb25seScpO1xufVxuXG5mdW5jdGlvbiBnZXRTY2hlbWUgKGxvY2F0aW9uKSB7XG4gIGlmICh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbi5pbmRleE9mKCc6Ly8nKSA9PT0gLTEgPyAnJyA6IGxvY2F0aW9uLnNwbGl0KCc6Ly8nKVswXTtcbiAgfVxuXG4gIHJldHVybiBsb2NhdGlvbjtcbn1cblxuLyoqXG4gKiBVdGlsaXR5IHRoYXQgcHJvdmlkZXMgYSBzaW5nbGUgQVBJIGZvciBsb2FkaW5nIHRoZSBjb250ZW50IG9mIGEgcGF0aC9VUkwuXG4gKlxuICogQG1vZHVsZSBwYXRoLWxvYWRlclxuICovXG5cbmZ1bmN0aW9uIGdldExvYWRlciAobG9jYXRpb24pIHtcbiAgdmFyIHNjaGVtZSA9IGdldFNjaGVtZShsb2NhdGlvbik7XG4gIHZhciBsb2FkZXIgPSBzdXBwb3J0ZWRMb2FkZXJzW3NjaGVtZV07XG5cbiAgaWYgKHR5cGVvZiBsb2FkZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gJycpIHtcbiAgICAgIGxvYWRlciA9IGRlZmF1bHRMb2FkZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgc2NoZW1lOiAnICsgc2NoZW1lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbG9hZGVyO1xufVxuXG4vKipcbiAqIExvYWRzIGEgZG9jdW1lbnQgYXQgdGhlIHByb3ZpZGVkIGxvY2F0aW9uIGFuZCByZXR1cm5zIGEgSmF2YVNjcmlwdCBvYmplY3QgcmVwcmVzZW50YXRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIC0gVGhlIGxvY2F0aW9uIHRvIHRoZSBkb2N1bWVudFxuICogQHBhcmFtIHttb2R1bGU6cGF0aC1sb2FkZXIuTG9hZE9wdGlvbnN9IFtvcHRpb25zXSAtIFRoZSBsb2FkZXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPCo+fSBBbHdheXMgcmV0dXJucyBhIHByb21pc2UgZXZlbiBpZiB0aGVyZSBpcyBhIGNhbGxiYWNrIHByb3ZpZGVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEV4YW1wbGUgdXNpbmcgUHJvbWlzZXNcbiAqXG4gKiBQYXRoTG9hZGVyXG4gKiAgIC5sb2FkKCcuL3BhY2thZ2UuanNvbicpXG4gKiAgIC50aGVuKEpTT04ucGFyc2UpXG4gKiAgIC50aGVuKGZ1bmN0aW9uIChkb2N1bWVudCkge1xuICogICAgIGNvbnNvbGUubG9nKGRvY3VtZW50Lm5hbWUgKyAnICgnICsgZG9jdW1lbnQudmVyc2lvbiArICcpOiAnICsgZG9jdW1lbnQuZGVzY3JpcHRpb24pO1xuICogICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xuICogICB9KTtcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRXhhbXBsZSB1c2luZyBvcHRpb25zLnByZXBhcmVSZXF1ZXN0IHRvIHByb3ZpZGUgYXV0aGVudGljYXRpb24gZGV0YWlscyBmb3IgYSByZW1vdGVseSBzZWN1cmUgVVJMXG4gKlxuICogUGF0aExvYWRlclxuICogICAubG9hZCgnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy93aGl0bG9ja2pjL3BhdGgtbG9hZGVyJywge1xuICogICAgIHByZXBhcmVSZXF1ZXN0OiBmdW5jdGlvbiAocmVxLCBjYWxsYmFjaykge1xuICogICAgICAgcmVxLmF1dGgoJ215LXVzZXJuYW1lJywgJ215LXBhc3N3b3JkJyk7XG4gKiAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIHJlcSk7XG4gKiAgICAgfVxuICogICB9KVxuICogICAudGhlbihKU09OLnBhcnNlKVxuICogICAudGhlbihmdW5jdGlvbiAoZG9jdW1lbnQpIHtcbiAqICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5mdWxsX25hbWUgKyAnOiAnICsgZG9jdW1lbnQuZGVzY3JpcHRpb24pO1xuICogICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xuICogICB9KTtcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRXhhbXBsZSBsb2FkaW5nIGEgWUFNTCBmaWxlXG4gKlxuICogUGF0aExvYWRlclxuICogICAubG9hZCgnL1VzZXJzL25vdC15b3UvcHJvamVjdHMvcGF0aC1sb2FkZXIvLnRyYXZpcy55bWwnKVxuICogICAudGhlbihZQU1MLnNhZmVMb2FkKVxuICogICAudGhlbihmdW5jdGlvbiAoZG9jdW1lbnQpIHtcbiAqICAgICBjb25zb2xlLmxvZygncGF0aC1sb2FkZXIgdXNlcyB0aGUnLCBkb2N1bWVudC5sYW5ndWFnZSwgJ2xhbmd1YWdlLicpO1xuICogICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xuICogICB9KTtcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRXhhbXBsZSBsb2FkaW5nIGEgWUFNTCBmaWxlIHdpdGggb3B0aW9ucy5wcm9jZXNzQ29udGVudCAoVXNlZnVsIGlmIHlvdSBuZWVkIGluZm9ybWF0aW9uIGluIHRoZSByYXcgcmVzcG9uc2UpXG4gKlxuICogUGF0aExvYWRlclxuICogICAubG9hZCgnL1VzZXJzL25vdC15b3UvcHJvamVjdHMvcGF0aC1sb2FkZXIvLnRyYXZpcy55bWwnLCB7XG4gKiAgICAgcHJvY2Vzc0NvbnRlbnQ6IGZ1bmN0aW9uIChyZXMsIGNhbGxiYWNrKSB7XG4gKiAgICAgICBjYWxsYmFjayhZQU1MLnNhZmVMb2FkKHJlcy50ZXh0KSk7XG4gKiAgICAgfVxuICogICB9KVxuICogICAudGhlbihmdW5jdGlvbiAoZG9jdW1lbnQpIHtcbiAqICAgICBjb25zb2xlLmxvZygncGF0aC1sb2FkZXIgdXNlcyB0aGUnLCBkb2N1bWVudC5sYW5ndWFnZSwgJ2xhbmd1YWdlLicpO1xuICogICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spO1xuICogICB9KTtcbiAqL1xubW9kdWxlLmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChsb2NhdGlvbiwgb3B0aW9ucykge1xuICB2YXIgYWxsVGFza3MgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICAvLyBEZWZhdWx0IG9wdGlvbnMgdG8gZW1wdHkgb2JqZWN0XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBhcmd1bWVudHNcbiAgYWxsVGFza3MgPSBhbGxUYXNrcy50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIGxvY2F0aW9uID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbG9jYXRpb24gaXMgcmVxdWlyZWQnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2xvY2F0aW9uIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMucHJvY2Vzc0NvbnRlbnQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBvcHRpb25zLnByb2Nlc3NDb250ZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMucHJvY2Vzc0NvbnRlbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBMb2FkIHRoZSBkb2N1bWVudCBmcm9tIHRoZSBwcm92aWRlZCBsb2NhdGlvbiBhbmQgcHJvY2VzcyBpdFxuICBhbGxUYXNrcyA9IGFsbFRhc2tzXG4gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIGxvYWRlciA9IGdldExvYWRlcihsb2NhdGlvbik7XG5cbiAgICAgICAgbG9hZGVyLmxvYWQobG9jYXRpb24sIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlcnIsIGRvY3VtZW50KSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoZG9jdW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGlmIChvcHRpb25zLnByb2Nlc3NDb250ZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgLy8gRm9yIGNvbnNpc3RlbmN5IGJldHdlZW4gZmlsZSBhbmQgaHR0cCwgYWx3YXlzIHNlbmQgYW4gb2JqZWN0IHdpdGggYSAndGV4dCcgcHJvcGVydHkgY29udGFpbmluZyB0aGUgcmF3XG4gICAgICAgICAgLy8gc3RyaW5nIHZhbHVlIGJlaW5nIHByb2Nlc3NlZC5cbiAgICAgICAgICBpZiAodHlwZW9mIHJlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJlcyA9IHt0ZXh0OiByZXN9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFBhc3MgdGhlIHBhdGggYmVpbmcgbG9hZGVkXG4gICAgICAgICAgcmVzLmxvY2F0aW9uID0gbG9jYXRpb247XG5cbiAgICAgICAgICBvcHRpb25zLnByb2Nlc3NDb250ZW50KHJlcywgZnVuY3Rpb24gKGVyciwgcHJvY2Vzc2VkKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShwcm9jZXNzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBubyBjb250ZW50IHByb2Nlc3Nvciwgd2Ugd2lsbCBhc3N1bWUgdGhhdCBmb3IgYWxsIG9iamVjdHMgdGhhdCBpdCBpcyBhIFN1cGVyYWdlbnQgcmVzcG9uc2VcbiAgICAgICAgLy8gYW5kIHdpbGwgcmV0dXJuIGl0cyBgdGV4dGAgcHJvcGVydHkgdmFsdWUuICBPdGhlcndpc2UsIHdlIHdpbGwgcmV0dXJuIHRoZSByYXcgcmVzcG9uc2UuXG4gICAgICAgIHJldHVybiB0eXBlb2YgcmVzID09PSAnb2JqZWN0JyA/IHJlcy50ZXh0IDogcmVzO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIHJldHVybiBhbGxUYXNrcztcbn07XG4iLCIvKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEplcmVteSBXaGl0bG9ja1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdW5zdXBwb3J0ZWRFcnJvciA9IG5ldyBUeXBlRXJyb3IoJ1RoZSBcXCdmaWxlXFwnIHNjaGVtZSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBicm93c2VyJyk7XG5cbi8qKlxuICogVGhlIGZpbGUgbG9hZGVyIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhlIGJyb3dzZXIuXG4gKlxuICogQHRocm93cyB7ZXJyb3J9IHRoZSBmaWxlIGxvYWRlciBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBicm93c2VyXG4gKi9cbm1vZHVsZS5leHBvcnRzLmdldEJhc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHRocm93IHVuc3VwcG9ydGVkRXJyb3I7XG59O1xuXG4vKipcbiAqIFRoZSBmaWxlIGxvYWRlciBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBicm93c2VyLlxuICovXG5tb2R1bGUuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZm4gPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuXG4gIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbih1bnN1cHBvcnRlZEVycm9yKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnN1cHBvcnRlZEVycm9yO1xuICB9XG59O1xuIiwiLyogZXNsaW50LWVudiBub2RlLCBicm93c2VyICovXG5cbi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgSmVyZW15IFdoaXRsb2NrXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG52YXIgc3VwcG9ydGVkSHR0cE1ldGhvZHMgPSBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwYXRjaCcsICdwb3N0JywgJ3B1dCddO1xuXG4vKipcbiAqIExvYWRzIGEgZmlsZSBmcm9tIGFuIGh0dHAgb3IgaHR0cHMgVVJMLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbiAtIFRoZSBkb2N1bWVudCBVUkwgKElmIHJlbGF0aXZlLCBsb2NhdGlvbiBpcyByZWxhdGl2ZSB0byB3aW5kb3cubG9jYXRpb24ub3JpZ2luKS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gVGhlIGxvYWRlciBvcHRpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubWV0aG9kPWdldF0gLSBUaGUgSFRUUCBtZXRob2QgdG8gdXNlIGZvciB0aGUgcmVxdWVzdFxuICogQHBhcmFtIHttb2R1bGU6UGF0aExvYWRlcn5QcmVwYXJlUmVxdWVzdENhbGxiYWNrfSBbb3B0aW9ucy5wcmVwYXJlUmVxdWVzdF0gLSBUaGUgY2FsbGJhY2sgdXNlZCB0byBwcmVwYXJlIGEgcmVxdWVzdFxuICogQHBhcmFtIHttb2R1bGU6UGF0aExvYWRlcn5Qcm9jZXNzUmVzcG9uc2VDYWxsYmFja30gW29wdGlvbnMucHJvY2Vzc0NvbnRlbnRdIC0gVGhlIGNhbGxiYWNrIHVzZWQgdG8gcHJvY2VzcyB0aGVcbiAqIHJlc3BvbnNlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBlcnJvci1maXJzdCBjYWxsYmFja1xuICovXG5tb2R1bGUuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGxvY2F0aW9uLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIgcmVhbE1ldGhvZCA9IG9wdGlvbnMubWV0aG9kID8gb3B0aW9ucy5tZXRob2QudG9Mb3dlckNhc2UoKSA6ICdnZXQnO1xuICB2YXIgZXJyO1xuICB2YXIgcmVhbFJlcXVlc3Q7XG5cbiAgZnVuY3Rpb24gbWFrZVJlcXVlc3QgKGVyciwgcmVxKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYnVmZmVyKCkgaXMgb25seSBhdmFpbGFibGUgaW4gTm9kZS5qc1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9jZXNzIDogMCkgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyAmJlxuICAgICAgICAgIHR5cGVvZiByZXEuYnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlcS5idWZmZXIodHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIHJlcVxuICAgICAgICAuZW5kKGZ1bmN0aW9uIChlcnIyLCByZXMpIHtcbiAgICAgICAgICBpZiAoZXJyMikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVuZGVmaW5lZCwgcmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5tZXRob2QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLm1ldGhvZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGVyciA9IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMubWV0aG9kIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB9IGVsc2UgaWYgKHN1cHBvcnRlZEh0dHBNZXRob2RzLmluZGV4T2Yob3B0aW9ucy5tZXRob2QpID09PSAtMSkge1xuICAgICAgZXJyID0gbmV3IFR5cGVFcnJvcignb3B0aW9ucy5tZXRob2QgbXVzdCBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZzogJyArXG4gICAgICAgIHN1cHBvcnRlZEh0dHBNZXRob2RzLnNsaWNlKDAsIHN1cHBvcnRlZEh0dHBNZXRob2RzLmxlbmd0aCAtIDEpLmpvaW4oJywgJykgKyAnIG9yICcgK1xuICAgICAgICBzdXBwb3J0ZWRIdHRwTWV0aG9kc1tzdXBwb3J0ZWRIdHRwTWV0aG9kcy5sZW5ndGggLSAxXSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLnByZXBhcmVSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygb3B0aW9ucy5wcmVwYXJlUmVxdWVzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGVyciA9IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMucHJlcGFyZVJlcXVlc3QgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICBpZiAoIWVycikge1xuICAgIHJlYWxSZXF1ZXN0ID0gcmVxdWVzdFtyZWFsTWV0aG9kID09PSAnZGVsZXRlJyA/ICdkZWwnIDogcmVhbE1ldGhvZF0obG9jYXRpb24pO1xuXG4gICAgaWYgKG9wdGlvbnMucHJlcGFyZVJlcXVlc3QpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMucHJlcGFyZVJlcXVlc3QocmVhbFJlcXVlc3QsIG1ha2VSZXF1ZXN0KTtcbiAgICAgIH0gY2F0Y2ggKGVycjIpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyMik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1ha2VSZXF1ZXN0KHVuZGVmaW5lZCwgcmVhbFJlcXVlc3QpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnZ2V0LWludHJpbnNpYycpO1xuXG52YXIgY2FsbEJpbmQgPSByZXF1aXJlKCcuLycpO1xuXG52YXIgJGluZGV4T2YgPSBjYWxsQmluZChHZXRJbnRyaW5zaWMoJ1N0cmluZy5wcm90b3R5cGUuaW5kZXhPZicpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYWxsQm91bmRJbnRyaW5zaWMobmFtZSwgYWxsb3dNaXNzaW5nKSB7XG5cdHZhciBpbnRyaW5zaWMgPSBHZXRJbnRyaW5zaWMobmFtZSwgISFhbGxvd01pc3NpbmcpO1xuXHRpZiAodHlwZW9mIGludHJpbnNpYyA9PT0gJ2Z1bmN0aW9uJyAmJiAkaW5kZXhPZihuYW1lLCAnLnByb3RvdHlwZS4nKSA+IC0xKSB7XG5cdFx0cmV0dXJuIGNhbGxCaW5kKGludHJpbnNpYyk7XG5cdH1cblx0cmV0dXJuIGludHJpbnNpYztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnZnVuY3Rpb24tYmluZCcpO1xudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyICRhcHBseSA9IEdldEludHJpbnNpYygnJUZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseSUnKTtcbnZhciAkY2FsbCA9IEdldEludHJpbnNpYygnJUZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsJScpO1xudmFyICRyZWZsZWN0QXBwbHkgPSBHZXRJbnRyaW5zaWMoJyVSZWZsZWN0LmFwcGx5JScsIHRydWUpIHx8IGJpbmQuY2FsbCgkY2FsbCwgJGFwcGx5KTtcblxudmFyICRnT1BEID0gR2V0SW50cmluc2ljKCclT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciUnLCB0cnVlKTtcbnZhciAkZGVmaW5lUHJvcGVydHkgPSBHZXRJbnRyaW5zaWMoJyVPYmplY3QuZGVmaW5lUHJvcGVydHklJywgdHJ1ZSk7XG52YXIgJG1heCA9IEdldEludHJpbnNpYygnJU1hdGgubWF4JScpO1xuXG5pZiAoJGRlZmluZVByb3BlcnR5KSB7XG5cdHRyeSB7XG5cdFx0JGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgdmFsdWU6IDEgfSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBJRSA4IGhhcyBhIGJyb2tlbiBkZWZpbmVQcm9wZXJ0eVxuXHRcdCRkZWZpbmVQcm9wZXJ0eSA9IG51bGw7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYWxsQmluZChvcmlnaW5hbEZ1bmN0aW9uKSB7XG5cdHZhciBmdW5jID0gJHJlZmxlY3RBcHBseShiaW5kLCAkY2FsbCwgYXJndW1lbnRzKTtcblx0aWYgKCRnT1BEICYmICRkZWZpbmVQcm9wZXJ0eSkge1xuXHRcdHZhciBkZXNjID0gJGdPUEQoZnVuYywgJ2xlbmd0aCcpO1xuXHRcdGlmIChkZXNjLmNvbmZpZ3VyYWJsZSkge1xuXHRcdFx0Ly8gb3JpZ2luYWwgbGVuZ3RoLCBwbHVzIHRoZSByZWNlaXZlciwgbWludXMgYW55IGFkZGl0aW9uYWwgYXJndW1lbnRzIChhZnRlciB0aGUgcmVjZWl2ZXIpXG5cdFx0XHQkZGVmaW5lUHJvcGVydHkoXG5cdFx0XHRcdGZ1bmMsXG5cdFx0XHRcdCdsZW5ndGgnLFxuXHRcdFx0XHR7IHZhbHVlOiAxICsgJG1heCgwLCBvcmlnaW5hbEZ1bmN0aW9uLmxlbmd0aCAtIChhcmd1bWVudHMubGVuZ3RoIC0gMSkpIH1cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmdW5jO1xufTtcblxudmFyIGFwcGx5QmluZCA9IGZ1bmN0aW9uIGFwcGx5QmluZCgpIHtcblx0cmV0dXJuICRyZWZsZWN0QXBwbHkoYmluZCwgJGFwcGx5LCBhcmd1bWVudHMpO1xufTtcblxuaWYgKCRkZWZpbmVQcm9wZXJ0eSkge1xuXHQkZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdhcHBseScsIHsgdmFsdWU6IGFwcGx5QmluZCB9KTtcbn0gZWxzZSB7XG5cdG1vZHVsZS5leHBvcnRzLmFwcGx5ID0gYXBwbHlCaW5kO1xufVxuIiwiXHJcbi8qKlxyXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxyXG4gKlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XHJcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XHJcbn07XHJcblxyXG4vKipcclxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG1peGluKG9iaikge1xyXG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xyXG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xyXG4gIH1cclxuICByZXR1cm4gb2JqO1xyXG59XHJcblxyXG4vKipcclxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub24gPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxyXG4gICAgLnB1c2goZm4pO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxyXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICBmdW5jdGlvbiBvbigpIHtcclxuICAgIHRoaXMub2ZmKGV2ZW50LCBvbik7XHJcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuXHJcbiAgb24uZm4gPSBmbjtcclxuICB0aGlzLm9uKGV2ZW50LCBvbik7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcclxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG5cclxuICAvLyBhbGxcclxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gc3BlY2lmaWMgZXZlbnRcclxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcclxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcclxuICB2YXIgY2I7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xyXG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcclxuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBSZW1vdmUgZXZlbnQgc3BlY2lmaWMgYXJyYXlzIGZvciBldmVudCB0eXBlcyB0aGF0IG5vXHJcbiAgLy8gb25lIGlzIHN1YnNjcmliZWQgZm9yIHRvIGF2b2lkIG1lbW9yeSBsZWFrLlxyXG4gIGlmIChjYWxsYmFja3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtNaXhlZH0gLi4uXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcblxyXG4gIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKVxyXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcbiAgfVxyXG5cclxuICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcmV0dXJuIHtBcnJheX1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHN0cmluZ2lmeVxuc3RyaW5naWZ5LmRlZmF1bHQgPSBzdHJpbmdpZnlcbnN0cmluZ2lmeS5zdGFibGUgPSBkZXRlcm1pbmlzdGljU3RyaW5naWZ5XG5zdHJpbmdpZnkuc3RhYmxlU3RyaW5naWZ5ID0gZGV0ZXJtaW5pc3RpY1N0cmluZ2lmeVxuXG52YXIgTElNSVRfUkVQTEFDRV9OT0RFID0gJ1suLi5dJ1xudmFyIENJUkNVTEFSX1JFUExBQ0VfTk9ERSA9ICdbQ2lyY3VsYXJdJ1xuXG52YXIgYXJyID0gW11cbnZhciByZXBsYWNlclN0YWNrID0gW11cblxuZnVuY3Rpb24gZGVmYXVsdE9wdGlvbnMgKCkge1xuICByZXR1cm4ge1xuICAgIGRlcHRoTGltaXQ6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgIGVkZ2VzTGltaXQ6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG4gIH1cbn1cblxuLy8gUmVndWxhciBzdHJpbmdpZnlcbmZ1bmN0aW9uIHN0cmluZ2lmeSAob2JqLCByZXBsYWNlciwgc3BhY2VyLCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBvcHRpb25zID0gZGVmYXVsdE9wdGlvbnMoKVxuICB9XG5cbiAgZGVjaXJjKG9iaiwgJycsIDAsIFtdLCB1bmRlZmluZWQsIDAsIG9wdGlvbnMpXG4gIHZhciByZXNcbiAgdHJ5IHtcbiAgICBpZiAocmVwbGFjZXJTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KG9iaiwgcmVwbGFjZXIsIHNwYWNlcilcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzID0gSlNPTi5zdHJpbmdpZnkob2JqLCByZXBsYWNlR2V0dGVyVmFsdWVzKHJlcGxhY2VyKSwgc3BhY2VyKVxuICAgIH1cbiAgfSBjYXRjaCAoXykge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSgnW3VuYWJsZSB0byBzZXJpYWxpemUsIGNpcmN1bGFyIHJlZmVyZW5jZSBpcyB0b28gY29tcGxleCB0byBhbmFseXplXScpXG4gIH0gZmluYWxseSB7XG4gICAgd2hpbGUgKGFyci5sZW5ndGggIT09IDApIHtcbiAgICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgICBpZiAocGFydC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcnRbMF0sIHBhcnRbMV0sIHBhcnRbM10pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0WzBdW3BhcnRbMV1dID0gcGFydFsyXVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIHNldFJlcGxhY2UgKHJlcGxhY2UsIHZhbCwgaywgcGFyZW50KSB7XG4gIHZhciBwcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHBhcmVudCwgaylcbiAgaWYgKHByb3BlcnR5RGVzY3JpcHRvci5nZXQgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChwcm9wZXJ0eURlc2NyaXB0b3IuY29uZmlndXJhYmxlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyZW50LCBrLCB7IHZhbHVlOiByZXBsYWNlIH0pXG4gICAgICBhcnIucHVzaChbcGFyZW50LCBrLCB2YWwsIHByb3BlcnR5RGVzY3JpcHRvcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcGxhY2VyU3RhY2sucHVzaChbdmFsLCBrLCByZXBsYWNlXSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50W2tdID0gcmVwbGFjZVxuICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVjaXJjICh2YWwsIGssIGVkZ2VJbmRleCwgc3RhY2ssIHBhcmVudCwgZGVwdGgsIG9wdGlvbnMpIHtcbiAgZGVwdGggKz0gMVxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc3RhY2tbaV0gPT09IHZhbCkge1xuICAgICAgICBzZXRSZXBsYWNlKENJUkNVTEFSX1JFUExBQ0VfTk9ERSwgdmFsLCBrLCBwYXJlbnQpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBvcHRpb25zLmRlcHRoTGltaXQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICBkZXB0aCA+IG9wdGlvbnMuZGVwdGhMaW1pdFxuICAgICkge1xuICAgICAgc2V0UmVwbGFjZShMSU1JVF9SRVBMQUNFX05PREUsIHZhbCwgaywgcGFyZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIG9wdGlvbnMuZWRnZXNMaW1pdCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIGVkZ2VJbmRleCArIDEgPiBvcHRpb25zLmVkZ2VzTGltaXRcbiAgICApIHtcbiAgICAgIHNldFJlcGxhY2UoTElNSVRfUkVQTEFDRV9OT0RFLCB2YWwsIGssIHBhcmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHN0YWNrLnB1c2godmFsKVxuICAgIC8vIE9wdGltaXplIGZvciBBcnJheXMuIEJpZyBhcnJheXMgY291bGQga2lsbCB0aGUgcGVyZm9ybWFuY2Ugb3RoZXJ3aXNlIVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVjaXJjKHZhbFtpXSwgaSwgaSwgc3RhY2ssIHZhbCwgZGVwdGgsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsKVxuICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgZGVjaXJjKHZhbFtrZXldLCBrZXksIGksIHN0YWNrLCB2YWwsIGRlcHRoLCBvcHRpb25zKVxuICAgICAgfVxuICAgIH1cbiAgICBzdGFjay5wb3AoKVxuICB9XG59XG5cbi8vIFN0YWJsZS1zdHJpbmdpZnlcbmZ1bmN0aW9uIGNvbXBhcmVGdW5jdGlvbiAoYSwgYikge1xuICBpZiAoYSA8IGIpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoYSA+IGIpIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGRldGVybWluaXN0aWNTdHJpbmdpZnkgKG9iaiwgcmVwbGFjZXIsIHNwYWNlciwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zKClcbiAgfVxuXG4gIHZhciB0bXAgPSBkZXRlcm1pbmlzdGljRGVjaXJjKG9iaiwgJycsIDAsIFtdLCB1bmRlZmluZWQsIDAsIG9wdGlvbnMpIHx8IG9ialxuICB2YXIgcmVzXG4gIHRyeSB7XG4gICAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICByZXMgPSBKU09OLnN0cmluZ2lmeSh0bXAsIHJlcGxhY2VyLCBzcGFjZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KHRtcCwgcmVwbGFjZUdldHRlclZhbHVlcyhyZXBsYWNlciksIHNwYWNlcilcbiAgICB9XG4gIH0gY2F0Y2ggKF8pIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoJ1t1bmFibGUgdG8gc2VyaWFsaXplLCBjaXJjdWxhciByZWZlcmVuY2UgaXMgdG9vIGNvbXBsZXggdG8gYW5hbHl6ZV0nKVxuICB9IGZpbmFsbHkge1xuICAgIC8vIEVuc3VyZSB0aGF0IHdlIHJlc3RvcmUgdGhlIG9iamVjdCBhcyBpdCB3YXMuXG4gICAgd2hpbGUgKGFyci5sZW5ndGggIT09IDApIHtcbiAgICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgICBpZiAocGFydC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcnRbMF0sIHBhcnRbMV0sIHBhcnRbM10pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0WzBdW3BhcnRbMV1dID0gcGFydFsyXVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGRldGVybWluaXN0aWNEZWNpcmMgKHZhbCwgaywgZWRnZUluZGV4LCBzdGFjaywgcGFyZW50LCBkZXB0aCwgb3B0aW9ucykge1xuICBkZXB0aCArPSAxXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyAmJiB2YWwgIT09IG51bGwpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzdGFja1tpXSA9PT0gdmFsKSB7XG4gICAgICAgIHNldFJlcGxhY2UoQ0lSQ1VMQVJfUkVQTEFDRV9OT0RFLCB2YWwsIGssIHBhcmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIHZhbC50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIG9wdGlvbnMuZGVwdGhMaW1pdCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIGRlcHRoID4gb3B0aW9ucy5kZXB0aExpbWl0XG4gICAgKSB7XG4gICAgICBzZXRSZXBsYWNlKExJTUlUX1JFUExBQ0VfTk9ERSwgdmFsLCBrLCBwYXJlbnQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0eXBlb2Ygb3B0aW9ucy5lZGdlc0xpbWl0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgZWRnZUluZGV4ICsgMSA+IG9wdGlvbnMuZWRnZXNMaW1pdFxuICAgICkge1xuICAgICAgc2V0UmVwbGFjZShMSU1JVF9SRVBMQUNFX05PREUsIHZhbCwgaywgcGFyZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgc3RhY2sucHVzaCh2YWwpXG4gICAgLy8gT3B0aW1pemUgZm9yIEFycmF5cy4gQmlnIGFycmF5cyBjb3VsZCBraWxsIHRoZSBwZXJmb3JtYW5jZSBvdGhlcndpc2UhXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZXRlcm1pbmlzdGljRGVjaXJjKHZhbFtpXSwgaSwgaSwgc3RhY2ssIHZhbCwgZGVwdGgsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBvYmplY3QgaW4gdGhlIHJlcXVpcmVkIHdheVxuICAgICAgdmFyIHRtcCA9IHt9XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbCkuc29ydChjb21wYXJlRnVuY3Rpb24pXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICBkZXRlcm1pbmlzdGljRGVjaXJjKHZhbFtrZXldLCBrZXksIGksIHN0YWNrLCB2YWwsIGRlcHRoLCBvcHRpb25zKVxuICAgICAgICB0bXBba2V5XSA9IHZhbFtrZXldXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcmVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsXSlcbiAgICAgICAgcGFyZW50W2tdID0gdG1wXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdG1wXG4gICAgICB9XG4gICAgfVxuICAgIHN0YWNrLnBvcCgpXG4gIH1cbn1cblxuLy8gd3JhcHMgcmVwbGFjZXIgZnVuY3Rpb24gdG8gaGFuZGxlIHZhbHVlcyB3ZSBjb3VsZG4ndCByZXBsYWNlXG4vLyBhbmQgbWFyayB0aGVtIGFzIHJlcGxhY2VkIHZhbHVlXG5mdW5jdGlvbiByZXBsYWNlR2V0dGVyVmFsdWVzIChyZXBsYWNlcikge1xuICByZXBsYWNlciA9XG4gICAgdHlwZW9mIHJlcGxhY2VyICE9PSAndW5kZWZpbmVkJ1xuICAgICAgPyByZXBsYWNlclxuICAgICAgOiBmdW5jdGlvbiAoaywgdikge1xuICAgICAgICByZXR1cm4gdlxuICAgICAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGtleSwgdmFsKSB7XG4gICAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXBsYWNlclN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcmVwbGFjZXJTdGFja1tpXVxuICAgICAgICBpZiAocGFydFsxXSA9PT0ga2V5ICYmIHBhcnRbMF0gPT09IHZhbCkge1xuICAgICAgICAgIHZhbCA9IHBhcnRbMl1cbiAgICAgICAgICByZXBsYWNlclN0YWNrLnNwbGljZShpLCAxKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWwpXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50IG5vLWludmFsaWQtdGhpczogMSAqL1xuXG52YXIgRVJST1JfTUVTU0FHRSA9ICdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBjYWxsZWQgb24gaW5jb21wYXRpYmxlICc7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGZ1bmNUeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKHRoYXQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcztcbiAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKHRhcmdldCkgIT09IGZ1bmNUeXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRVJST1JfTUVTU0FHRSArIHRhcmdldCk7XG4gICAgfVxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgdmFyIGJvdW5kO1xuICAgIHZhciBiaW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmFwcGx5KFxuICAgICAgICAgICAgICAgIHRoYXQsXG4gICAgICAgICAgICAgICAgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgYm91bmRMZW5ndGggPSBNYXRoLm1heCgwLCB0YXJnZXQubGVuZ3RoIC0gYXJncy5sZW5ndGgpO1xuICAgIHZhciBib3VuZEFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvdW5kTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYm91bmRBcmdzLnB1c2goJyQnICsgaSk7XG4gICAgfVxuXG4gICAgYm91bmQgPSBGdW5jdGlvbignYmluZGVyJywgJ3JldHVybiBmdW5jdGlvbiAoJyArIGJvdW5kQXJncy5qb2luKCcsJykgKyAnKXsgcmV0dXJuIGJpbmRlci5hcHBseSh0aGlzLGFyZ3VtZW50cyk7IH0nKShiaW5kZXIpO1xuXG4gICAgaWYgKHRhcmdldC5wcm90b3R5cGUpIHtcbiAgICAgICAgdmFyIEVtcHR5ID0gZnVuY3Rpb24gRW1wdHkoKSB7fTtcbiAgICAgICAgRW1wdHkucHJvdG90eXBlID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgYm91bmQucHJvdG90eXBlID0gbmV3IEVtcHR5KCk7XG4gICAgICAgIEVtcHR5LnByb3RvdHlwZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGltcGxlbWVudGF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdW5kZWZpbmVkO1xuXG52YXIgJFN5bnRheEVycm9yID0gU3ludGF4RXJyb3I7XG52YXIgJEZ1bmN0aW9uID0gRnVuY3Rpb247XG52YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG52YXIgZ2V0RXZhbGxlZENvbnN0cnVjdG9yID0gZnVuY3Rpb24gKGV4cHJlc3Npb25TeW50YXgpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gJEZ1bmN0aW9uKCdcInVzZSBzdHJpY3RcIjsgcmV0dXJuICgnICsgZXhwcmVzc2lvblN5bnRheCArICcpLmNvbnN0cnVjdG9yOycpKCk7XG5cdH0gY2F0Y2ggKGUpIHt9XG59O1xuXG52YXIgJGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuaWYgKCRnT1BEKSB7XG5cdHRyeSB7XG5cdFx0JGdPUEQoe30sICcnKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdCRnT1BEID0gbnVsbDsgLy8gdGhpcyBpcyBJRSA4LCB3aGljaCBoYXMgYSBicm9rZW4gZ09QRFxuXHR9XG59XG5cbnZhciB0aHJvd1R5cGVFcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoKTtcbn07XG52YXIgVGhyb3dUeXBlRXJyb3IgPSAkZ09QRFxuXHQ/IChmdW5jdGlvbiAoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLWNhbGxlciwgbm8tcmVzdHJpY3RlZC1wcm9wZXJ0aWVzXG5cdFx0XHRhcmd1bWVudHMuY2FsbGVlOyAvLyBJRSA4IGRvZXMgbm90IHRocm93IGhlcmVcblx0XHRcdHJldHVybiB0aHJvd1R5cGVFcnJvcjtcblx0XHR9IGNhdGNoIChjYWxsZWVUaHJvd3MpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8vIElFIDggdGhyb3dzIG9uIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYXJndW1lbnRzLCAnJylcblx0XHRcdFx0cmV0dXJuICRnT1BEKGFyZ3VtZW50cywgJ2NhbGxlZScpLmdldDtcblx0XHRcdH0gY2F0Y2ggKGdPUER0aHJvd3MpIHtcblx0XHRcdFx0cmV0dXJuIHRocm93VHlwZUVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fSgpKVxuXHQ6IHRocm93VHlwZUVycm9yO1xuXG52YXIgaGFzU3ltYm9scyA9IHJlcXVpcmUoJ2hhcy1zeW1ib2xzJykoKTtcblxudmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Ll9fcHJvdG9fXzsgfTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b1xuXG52YXIgbmVlZHNFdmFsID0ge307XG5cbnZhciBUeXBlZEFycmF5ID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogZ2V0UHJvdG8oVWludDhBcnJheSk7XG5cbnZhciBJTlRSSU5TSUNTID0ge1xuXHQnJUFnZ3JlZ2F0ZUVycm9yJSc6IHR5cGVvZiBBZ2dyZWdhdGVFcnJvciA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBBZ2dyZWdhdGVFcnJvcixcblx0JyVBcnJheSUnOiBBcnJheSxcblx0JyVBcnJheUJ1ZmZlciUnOiB0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQXJyYXlCdWZmZXIsXG5cdCclQXJyYXlJdGVyYXRvclByb3RvdHlwZSUnOiBoYXNTeW1ib2xzID8gZ2V0UHJvdG8oW11bU3ltYm9sLml0ZXJhdG9yXSgpKSA6IHVuZGVmaW5lZCxcblx0JyVBc3luY0Zyb21TeW5jSXRlcmF0b3JQcm90b3R5cGUlJzogdW5kZWZpbmVkLFxuXHQnJUFzeW5jRnVuY3Rpb24lJzogbmVlZHNFdmFsLFxuXHQnJUFzeW5jR2VuZXJhdG9yJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0dlbmVyYXRvckZ1bmN0aW9uJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0l0ZXJhdG9yUHJvdG90eXBlJSc6IG5lZWRzRXZhbCxcblx0JyVBdG9taWNzJSc6IHR5cGVvZiBBdG9taWNzID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEF0b21pY3MsXG5cdCclQmlnSW50JSc6IHR5cGVvZiBCaWdJbnQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQmlnSW50LFxuXHQnJUJvb2xlYW4lJzogQm9vbGVhbixcblx0JyVEYXRhVmlldyUnOiB0eXBlb2YgRGF0YVZpZXcgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogRGF0YVZpZXcsXG5cdCclRGF0ZSUnOiBEYXRlLFxuXHQnJWRlY29kZVVSSSUnOiBkZWNvZGVVUkksXG5cdCclZGVjb2RlVVJJQ29tcG9uZW50JSc6IGRlY29kZVVSSUNvbXBvbmVudCxcblx0JyVlbmNvZGVVUkklJzogZW5jb2RlVVJJLFxuXHQnJWVuY29kZVVSSUNvbXBvbmVudCUnOiBlbmNvZGVVUklDb21wb25lbnQsXG5cdCclRXJyb3IlJzogRXJyb3IsXG5cdCclZXZhbCUnOiBldmFsLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV2YWxcblx0JyVFdmFsRXJyb3IlJzogRXZhbEVycm9yLFxuXHQnJUZsb2F0MzJBcnJheSUnOiB0eXBlb2YgRmxvYXQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEZsb2F0MzJBcnJheSxcblx0JyVGbG9hdDY0QXJyYXklJzogdHlwZW9mIEZsb2F0NjRBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGbG9hdDY0QXJyYXksXG5cdCclRmluYWxpemF0aW9uUmVnaXN0cnklJzogdHlwZW9mIEZpbmFsaXphdGlvblJlZ2lzdHJ5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEZpbmFsaXphdGlvblJlZ2lzdHJ5LFxuXHQnJUZ1bmN0aW9uJSc6ICRGdW5jdGlvbixcblx0JyVHZW5lcmF0b3JGdW5jdGlvbiUnOiBuZWVkc0V2YWwsXG5cdCclSW50OEFycmF5JSc6IHR5cGVvZiBJbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogSW50OEFycmF5LFxuXHQnJUludDE2QXJyYXklJzogdHlwZW9mIEludDE2QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogSW50MTZBcnJheSxcblx0JyVJbnQzMkFycmF5JSc6IHR5cGVvZiBJbnQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDMyQXJyYXksXG5cdCclaXNGaW5pdGUlJzogaXNGaW5pdGUsXG5cdCclaXNOYU4lJzogaXNOYU4sXG5cdCclSXRlcmF0b3JQcm90b3R5cGUlJzogaGFzU3ltYm9scyA/IGdldFByb3RvKGdldFByb3RvKFtdW1N5bWJvbC5pdGVyYXRvcl0oKSkpIDogdW5kZWZpbmVkLFxuXHQnJUpTT04lJzogdHlwZW9mIEpTT04gPT09ICdvYmplY3QnID8gSlNPTiA6IHVuZGVmaW5lZCxcblx0JyVNYXAlJzogdHlwZW9mIE1hcCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBNYXAsXG5cdCclTWFwSXRlcmF0b3JQcm90b3R5cGUlJzogdHlwZW9mIE1hcCA9PT0gJ3VuZGVmaW5lZCcgfHwgIWhhc1N5bWJvbHMgPyB1bmRlZmluZWQgOiBnZXRQcm90byhuZXcgTWFwKClbU3ltYm9sLml0ZXJhdG9yXSgpKSxcblx0JyVNYXRoJSc6IE1hdGgsXG5cdCclTnVtYmVyJSc6IE51bWJlcixcblx0JyVPYmplY3QlJzogT2JqZWN0LFxuXHQnJXBhcnNlRmxvYXQlJzogcGFyc2VGbG9hdCxcblx0JyVwYXJzZUludCUnOiBwYXJzZUludCxcblx0JyVQcm9taXNlJSc6IHR5cGVvZiBQcm9taXNlID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFByb21pc2UsXG5cdCclUHJveHklJzogdHlwZW9mIFByb3h5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFByb3h5LFxuXHQnJVJhbmdlRXJyb3IlJzogUmFuZ2VFcnJvcixcblx0JyVSZWZlcmVuY2VFcnJvciUnOiBSZWZlcmVuY2VFcnJvcixcblx0JyVSZWZsZWN0JSc6IHR5cGVvZiBSZWZsZWN0ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFJlZmxlY3QsXG5cdCclUmVnRXhwJSc6IFJlZ0V4cCxcblx0JyVTZXQlJzogdHlwZW9mIFNldCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBTZXQsXG5cdCclU2V0SXRlcmF0b3JQcm90b3R5cGUlJzogdHlwZW9mIFNldCA9PT0gJ3VuZGVmaW5lZCcgfHwgIWhhc1N5bWJvbHMgPyB1bmRlZmluZWQgOiBnZXRQcm90byhuZXcgU2V0KClbU3ltYm9sLml0ZXJhdG9yXSgpKSxcblx0JyVTaGFyZWRBcnJheUJ1ZmZlciUnOiB0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogU2hhcmVkQXJyYXlCdWZmZXIsXG5cdCclU3RyaW5nJSc6IFN0cmluZyxcblx0JyVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUnOiBoYXNTeW1ib2xzID8gZ2V0UHJvdG8oJydbU3ltYm9sLml0ZXJhdG9yXSgpKSA6IHVuZGVmaW5lZCxcblx0JyVTeW1ib2wlJzogaGFzU3ltYm9scyA/IFN5bWJvbCA6IHVuZGVmaW5lZCxcblx0JyVTeW50YXhFcnJvciUnOiAkU3ludGF4RXJyb3IsXG5cdCclVGhyb3dUeXBlRXJyb3IlJzogVGhyb3dUeXBlRXJyb3IsXG5cdCclVHlwZWRBcnJheSUnOiBUeXBlZEFycmF5LFxuXHQnJVR5cGVFcnJvciUnOiAkVHlwZUVycm9yLFxuXHQnJVVpbnQ4QXJyYXklJzogdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogVWludDhBcnJheSxcblx0JyVVaW50OENsYW1wZWRBcnJheSUnOiB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogVWludDhDbGFtcGVkQXJyYXksXG5cdCclVWludDE2QXJyYXklJzogdHlwZW9mIFVpbnQxNkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFVpbnQxNkFycmF5LFxuXHQnJVVpbnQzMkFycmF5JSc6IHR5cGVvZiBVaW50MzJBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50MzJBcnJheSxcblx0JyVVUklFcnJvciUnOiBVUklFcnJvcixcblx0JyVXZWFrTWFwJSc6IHR5cGVvZiBXZWFrTWFwID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFdlYWtNYXAsXG5cdCclV2Vha1JlZiUnOiB0eXBlb2YgV2Vha1JlZiA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBXZWFrUmVmLFxuXHQnJVdlYWtTZXQlJzogdHlwZW9mIFdlYWtTZXQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogV2Vha1NldFxufTtcblxudmFyIGRvRXZhbCA9IGZ1bmN0aW9uIGRvRXZhbChuYW1lKSB7XG5cdHZhciB2YWx1ZTtcblx0aWYgKG5hbWUgPT09ICclQXN5bmNGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2FzeW5jIGZ1bmN0aW9uICgpIHt9Jyk7XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVHZW5lcmF0b3JGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2Z1bmN0aW9uKiAoKSB7fScpO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclQXN5bmNHZW5lcmF0b3JGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2FzeW5jIGZ1bmN0aW9uKiAoKSB7fScpO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclQXN5bmNHZW5lcmF0b3IlJykge1xuXHRcdHZhciBmbiA9IGRvRXZhbCgnJUFzeW5jR2VuZXJhdG9yRnVuY3Rpb24lJyk7XG5cdFx0aWYgKGZuKSB7XG5cdFx0XHR2YWx1ZSA9IGZuLnByb3RvdHlwZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVBc3luY0l0ZXJhdG9yUHJvdG90eXBlJScpIHtcblx0XHR2YXIgZ2VuID0gZG9FdmFsKCclQXN5bmNHZW5lcmF0b3IlJyk7XG5cdFx0aWYgKGdlbikge1xuXHRcdFx0dmFsdWUgPSBnZXRQcm90byhnZW4ucHJvdG90eXBlKTtcblx0XHR9XG5cdH1cblxuXHRJTlRSSU5TSUNTW25hbWVdID0gdmFsdWU7XG5cblx0cmV0dXJuIHZhbHVlO1xufTtcblxudmFyIExFR0FDWV9BTElBU0VTID0ge1xuXHQnJUFycmF5QnVmZmVyUHJvdG90eXBlJSc6IFsnQXJyYXlCdWZmZXInLCAncHJvdG90eXBlJ10sXG5cdCclQXJyYXlQcm90b3R5cGUlJzogWydBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVBcnJheVByb3RvX2VudHJpZXMlJzogWydBcnJheScsICdwcm90b3R5cGUnLCAnZW50cmllcyddLFxuXHQnJUFycmF5UHJvdG9fZm9yRWFjaCUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZScsICdmb3JFYWNoJ10sXG5cdCclQXJyYXlQcm90b19rZXlzJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ2tleXMnXSxcblx0JyVBcnJheVByb3RvX3ZhbHVlcyUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZScsICd2YWx1ZXMnXSxcblx0JyVBc3luY0Z1bmN0aW9uUHJvdG90eXBlJSc6IFsnQXN5bmNGdW5jdGlvbicsICdwcm90b3R5cGUnXSxcblx0JyVBc3luY0dlbmVyYXRvciUnOiBbJ0FzeW5jR2VuZXJhdG9yRnVuY3Rpb24nLCAncHJvdG90eXBlJ10sXG5cdCclQXN5bmNHZW5lcmF0b3JQcm90b3R5cGUlJzogWydBc3luY0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZScsICdwcm90b3R5cGUnXSxcblx0JyVCb29sZWFuUHJvdG90eXBlJSc6IFsnQm9vbGVhbicsICdwcm90b3R5cGUnXSxcblx0JyVEYXRhVmlld1Byb3RvdHlwZSUnOiBbJ0RhdGFWaWV3JywgJ3Byb3RvdHlwZSddLFxuXHQnJURhdGVQcm90b3R5cGUlJzogWydEYXRlJywgJ3Byb3RvdHlwZSddLFxuXHQnJUVycm9yUHJvdG90eXBlJSc6IFsnRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclRXZhbEVycm9yUHJvdG90eXBlJSc6IFsnRXZhbEVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJUZsb2F0MzJBcnJheVByb3RvdHlwZSUnOiBbJ0Zsb2F0MzJBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVGbG9hdDY0QXJyYXlQcm90b3R5cGUlJzogWydGbG9hdDY0QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclRnVuY3Rpb25Qcm90b3R5cGUlJzogWydGdW5jdGlvbicsICdwcm90b3R5cGUnXSxcblx0JyVHZW5lcmF0b3IlJzogWydHZW5lcmF0b3JGdW5jdGlvbicsICdwcm90b3R5cGUnXSxcblx0JyVHZW5lcmF0b3JQcm90b3R5cGUlJzogWydHZW5lcmF0b3JGdW5jdGlvbicsICdwcm90b3R5cGUnLCAncHJvdG90eXBlJ10sXG5cdCclSW50OEFycmF5UHJvdG90eXBlJSc6IFsnSW50OEFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUludDE2QXJyYXlQcm90b3R5cGUlJzogWydJbnQxNkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUludDMyQXJyYXlQcm90b3R5cGUlJzogWydJbnQzMkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUpTT05QYXJzZSUnOiBbJ0pTT04nLCAncGFyc2UnXSxcblx0JyVKU09OU3RyaW5naWZ5JSc6IFsnSlNPTicsICdzdHJpbmdpZnknXSxcblx0JyVNYXBQcm90b3R5cGUlJzogWydNYXAnLCAncHJvdG90eXBlJ10sXG5cdCclTnVtYmVyUHJvdG90eXBlJSc6IFsnTnVtYmVyJywgJ3Byb3RvdHlwZSddLFxuXHQnJU9iamVjdFByb3RvdHlwZSUnOiBbJ09iamVjdCcsICdwcm90b3R5cGUnXSxcblx0JyVPYmpQcm90b190b1N0cmluZyUnOiBbJ09iamVjdCcsICdwcm90b3R5cGUnLCAndG9TdHJpbmcnXSxcblx0JyVPYmpQcm90b192YWx1ZU9mJSc6IFsnT2JqZWN0JywgJ3Byb3RvdHlwZScsICd2YWx1ZU9mJ10sXG5cdCclUHJvbWlzZVByb3RvdHlwZSUnOiBbJ1Byb21pc2UnLCAncHJvdG90eXBlJ10sXG5cdCclUHJvbWlzZVByb3RvX3RoZW4lJzogWydQcm9taXNlJywgJ3Byb3RvdHlwZScsICd0aGVuJ10sXG5cdCclUHJvbWlzZV9hbGwlJzogWydQcm9taXNlJywgJ2FsbCddLFxuXHQnJVByb21pc2VfcmVqZWN0JSc6IFsnUHJvbWlzZScsICdyZWplY3QnXSxcblx0JyVQcm9taXNlX3Jlc29sdmUlJzogWydQcm9taXNlJywgJ3Jlc29sdmUnXSxcblx0JyVSYW5nZUVycm9yUHJvdG90eXBlJSc6IFsnUmFuZ2VFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVSZWZlcmVuY2VFcnJvclByb3RvdHlwZSUnOiBbJ1JlZmVyZW5jZUVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVJlZ0V4cFByb3RvdHlwZSUnOiBbJ1JlZ0V4cCcsICdwcm90b3R5cGUnXSxcblx0JyVTZXRQcm90b3R5cGUlJzogWydTZXQnLCAncHJvdG90eXBlJ10sXG5cdCclU2hhcmVkQXJyYXlCdWZmZXJQcm90b3R5cGUlJzogWydTaGFyZWRBcnJheUJ1ZmZlcicsICdwcm90b3R5cGUnXSxcblx0JyVTdHJpbmdQcm90b3R5cGUlJzogWydTdHJpbmcnLCAncHJvdG90eXBlJ10sXG5cdCclU3ltYm9sUHJvdG90eXBlJSc6IFsnU3ltYm9sJywgJ3Byb3RvdHlwZSddLFxuXHQnJVN5bnRheEVycm9yUHJvdG90eXBlJSc6IFsnU3ludGF4RXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclVHlwZWRBcnJheVByb3RvdHlwZSUnOiBbJ1R5cGVkQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVHlwZUVycm9yUHJvdG90eXBlJSc6IFsnVHlwZUVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVVpbnQ4QXJyYXlQcm90b3R5cGUlJzogWydVaW50OEFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVVpbnQ4Q2xhbXBlZEFycmF5UHJvdG90eXBlJSc6IFsnVWludDhDbGFtcGVkQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVWludDE2QXJyYXlQcm90b3R5cGUlJzogWydVaW50MTZBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVVaW50MzJBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQzMkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVVSSUVycm9yUHJvdG90eXBlJSc6IFsnVVJJRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclV2Vha01hcFByb3RvdHlwZSUnOiBbJ1dlYWtNYXAnLCAncHJvdG90eXBlJ10sXG5cdCclV2Vha1NldFByb3RvdHlwZSUnOiBbJ1dlYWtTZXQnLCAncHJvdG90eXBlJ11cbn07XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnZnVuY3Rpb24tYmluZCcpO1xudmFyIGhhc093biA9IHJlcXVpcmUoJ2hhcycpO1xudmFyICRjb25jYXQgPSBiaW5kLmNhbGwoRnVuY3Rpb24uY2FsbCwgQXJyYXkucHJvdG90eXBlLmNvbmNhdCk7XG52YXIgJHNwbGljZUFwcGx5ID0gYmluZC5jYWxsKEZ1bmN0aW9uLmFwcGx5LCBBcnJheS5wcm90b3R5cGUuc3BsaWNlKTtcbnZhciAkcmVwbGFjZSA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UpO1xudmFyICRzdHJTbGljZSA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBTdHJpbmcucHJvdG90eXBlLnNsaWNlKTtcbnZhciAkZXhlYyA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBSZWdFeHAucHJvdG90eXBlLmV4ZWMpO1xuXG4vKiBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2xvZGFzaC9sb2Rhc2gvYmxvYi80LjE3LjE1L2Rpc3QvbG9kYXNoLmpzI0w2NzM1LUw2NzQ0ICovXG52YXIgcmVQcm9wTmFtZSA9IC9bXiUuW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oPzpcXC58XFxbXFxdKSg/OlxcLnxcXFtcXF18JSQpKS9nO1xudmFyIHJlRXNjYXBlQ2hhciA9IC9cXFxcKFxcXFwpPy9nOyAvKiogVXNlZCB0byBtYXRjaCBiYWNrc2xhc2hlcyBpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciBzdHJpbmdUb1BhdGggPSBmdW5jdGlvbiBzdHJpbmdUb1BhdGgoc3RyaW5nKSB7XG5cdHZhciBmaXJzdCA9ICRzdHJTbGljZShzdHJpbmcsIDAsIDEpO1xuXHR2YXIgbGFzdCA9ICRzdHJTbGljZShzdHJpbmcsIC0xKTtcblx0aWYgKGZpcnN0ID09PSAnJScgJiYgbGFzdCAhPT0gJyUnKSB7XG5cdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcignaW52YWxpZCBpbnRyaW5zaWMgc3ludGF4LCBleHBlY3RlZCBjbG9zaW5nIGAlYCcpO1xuXHR9IGVsc2UgaWYgKGxhc3QgPT09ICclJyAmJiBmaXJzdCAhPT0gJyUnKSB7XG5cdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcignaW52YWxpZCBpbnRyaW5zaWMgc3ludGF4LCBleHBlY3RlZCBvcGVuaW5nIGAlYCcpO1xuXHR9XG5cdHZhciByZXN1bHQgPSBbXTtcblx0JHJlcGxhY2Uoc3RyaW5nLCByZVByb3BOYW1lLCBmdW5jdGlvbiAobWF0Y2gsIG51bWJlciwgcXVvdGUsIHN1YlN0cmluZykge1xuXHRcdHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHF1b3RlID8gJHJlcGxhY2Uoc3ViU3RyaW5nLCByZUVzY2FwZUNoYXIsICckMScpIDogbnVtYmVyIHx8IG1hdGNoO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG4vKiBlbmQgYWRhcHRhdGlvbiAqL1xuXG52YXIgZ2V0QmFzZUludHJpbnNpYyA9IGZ1bmN0aW9uIGdldEJhc2VJbnRyaW5zaWMobmFtZSwgYWxsb3dNaXNzaW5nKSB7XG5cdHZhciBpbnRyaW5zaWNOYW1lID0gbmFtZTtcblx0dmFyIGFsaWFzO1xuXHRpZiAoaGFzT3duKExFR0FDWV9BTElBU0VTLCBpbnRyaW5zaWNOYW1lKSkge1xuXHRcdGFsaWFzID0gTEVHQUNZX0FMSUFTRVNbaW50cmluc2ljTmFtZV07XG5cdFx0aW50cmluc2ljTmFtZSA9ICclJyArIGFsaWFzWzBdICsgJyUnO1xuXHR9XG5cblx0aWYgKGhhc093bihJTlRSSU5TSUNTLCBpbnRyaW5zaWNOYW1lKSkge1xuXHRcdHZhciB2YWx1ZSA9IElOVFJJTlNJQ1NbaW50cmluc2ljTmFtZV07XG5cdFx0aWYgKHZhbHVlID09PSBuZWVkc0V2YWwpIHtcblx0XHRcdHZhbHVlID0gZG9FdmFsKGludHJpbnNpY05hbWUpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyAmJiAhYWxsb3dNaXNzaW5nKSB7XG5cdFx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignaW50cmluc2ljICcgKyBuYW1lICsgJyBleGlzdHMsIGJ1dCBpcyBub3QgYXZhaWxhYmxlLiBQbGVhc2UgZmlsZSBhbiBpc3N1ZSEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0YWxpYXM6IGFsaWFzLFxuXHRcdFx0bmFtZTogaW50cmluc2ljTmFtZSxcblx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdH07XG5cdH1cblxuXHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnRyaW5zaWMgJyArIG5hbWUgKyAnIGRvZXMgbm90IGV4aXN0IScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBHZXRJbnRyaW5zaWMobmFtZSwgYWxsb3dNaXNzaW5nKSB7XG5cdGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgfHwgbmFtZS5sZW5ndGggPT09IDApIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignaW50cmluc2ljIG5hbWUgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKTtcblx0fVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFsbG93TWlzc2luZyAhPT0gJ2Jvb2xlYW4nKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ1wiYWxsb3dNaXNzaW5nXCIgYXJndW1lbnQgbXVzdCBiZSBhIGJvb2xlYW4nKTtcblx0fVxuXG5cdGlmICgkZXhlYygvXiU/W14lXSolPyQvZywgbmFtZSkgPT09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdgJWAgbWF5IG5vdCBiZSBwcmVzZW50IGFueXdoZXJlIGJ1dCBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgdGhlIGludHJpbnNpYyBuYW1lJyk7XG5cdH1cblx0dmFyIHBhcnRzID0gc3RyaW5nVG9QYXRoKG5hbWUpO1xuXHR2YXIgaW50cmluc2ljQmFzZU5hbWUgPSBwYXJ0cy5sZW5ndGggPiAwID8gcGFydHNbMF0gOiAnJztcblxuXHR2YXIgaW50cmluc2ljID0gZ2V0QmFzZUludHJpbnNpYygnJScgKyBpbnRyaW5zaWNCYXNlTmFtZSArICclJywgYWxsb3dNaXNzaW5nKTtcblx0dmFyIGludHJpbnNpY1JlYWxOYW1lID0gaW50cmluc2ljLm5hbWU7XG5cdHZhciB2YWx1ZSA9IGludHJpbnNpYy52YWx1ZTtcblx0dmFyIHNraXBGdXJ0aGVyQ2FjaGluZyA9IGZhbHNlO1xuXG5cdHZhciBhbGlhcyA9IGludHJpbnNpYy5hbGlhcztcblx0aWYgKGFsaWFzKSB7XG5cdFx0aW50cmluc2ljQmFzZU5hbWUgPSBhbGlhc1swXTtcblx0XHQkc3BsaWNlQXBwbHkocGFydHMsICRjb25jYXQoWzAsIDFdLCBhbGlhcykpO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDEsIGlzT3duID0gdHJ1ZTsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0dmFyIHBhcnQgPSBwYXJ0c1tpXTtcblx0XHR2YXIgZmlyc3QgPSAkc3RyU2xpY2UocGFydCwgMCwgMSk7XG5cdFx0dmFyIGxhc3QgPSAkc3RyU2xpY2UocGFydCwgLTEpO1xuXHRcdGlmIChcblx0XHRcdChcblx0XHRcdFx0KGZpcnN0ID09PSAnXCInIHx8IGZpcnN0ID09PSBcIidcIiB8fCBmaXJzdCA9PT0gJ2AnKVxuXHRcdFx0XHR8fCAobGFzdCA9PT0gJ1wiJyB8fCBsYXN0ID09PSBcIidcIiB8fCBsYXN0ID09PSAnYCcpXG5cdFx0XHQpXG5cdFx0XHQmJiBmaXJzdCAhPT0gbGFzdFxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcigncHJvcGVydHkgbmFtZXMgd2l0aCBxdW90ZXMgbXVzdCBoYXZlIG1hdGNoaW5nIHF1b3RlcycpO1xuXHRcdH1cblx0XHRpZiAocGFydCA9PT0gJ2NvbnN0cnVjdG9yJyB8fCAhaXNPd24pIHtcblx0XHRcdHNraXBGdXJ0aGVyQ2FjaGluZyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aW50cmluc2ljQmFzZU5hbWUgKz0gJy4nICsgcGFydDtcblx0XHRpbnRyaW5zaWNSZWFsTmFtZSA9ICclJyArIGludHJpbnNpY0Jhc2VOYW1lICsgJyUnO1xuXG5cdFx0aWYgKGhhc093bihJTlRSSU5TSUNTLCBpbnRyaW5zaWNSZWFsTmFtZSkpIHtcblx0XHRcdHZhbHVlID0gSU5UUklOU0lDU1tpbnRyaW5zaWNSZWFsTmFtZV07XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAoIShwYXJ0IGluIHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoIWFsbG93TWlzc2luZykge1xuXHRcdFx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdiYXNlIGludHJpbnNpYyBmb3IgJyArIG5hbWUgKyAnIGV4aXN0cywgYnV0IHRoZSBwcm9wZXJ0eSBpcyBub3QgYXZhaWxhYmxlLicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB2b2lkIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGlmICgkZ09QRCAmJiAoaSArIDEpID49IHBhcnRzLmxlbmd0aCkge1xuXHRcdFx0XHR2YXIgZGVzYyA9ICRnT1BEKHZhbHVlLCBwYXJ0KTtcblx0XHRcdFx0aXNPd24gPSAhIWRlc2M7XG5cblx0XHRcdFx0Ly8gQnkgY29udmVudGlvbiwgd2hlbiBhIGRhdGEgcHJvcGVydHkgaXMgY29udmVydGVkIHRvIGFuIGFjY2Vzc29yXG5cdFx0XHRcdC8vIHByb3BlcnR5IHRvIGVtdWxhdGUgYSBkYXRhIHByb3BlcnR5IHRoYXQgZG9lcyBub3Qgc3VmZmVyIGZyb21cblx0XHRcdFx0Ly8gdGhlIG92ZXJyaWRlIG1pc3Rha2UsIHRoYXQgYWNjZXNzb3IncyBnZXR0ZXIgaXMgbWFya2VkIHdpdGhcblx0XHRcdFx0Ly8gYW4gYG9yaWdpbmFsVmFsdWVgIHByb3BlcnR5LiBIZXJlLCB3aGVuIHdlIGRldGVjdCB0aGlzLCB3ZVxuXHRcdFx0XHQvLyB1cGhvbGQgdGhlIGlsbHVzaW9uIGJ5IHByZXRlbmRpbmcgdG8gc2VlIHRoYXQgb3JpZ2luYWwgZGF0YVxuXHRcdFx0XHQvLyBwcm9wZXJ0eSwgaS5lLiwgcmV0dXJuaW5nIHRoZSB2YWx1ZSByYXRoZXIgdGhhbiB0aGUgZ2V0dGVyXG5cdFx0XHRcdC8vIGl0c2VsZi5cblx0XHRcdFx0aWYgKGlzT3duICYmICdnZXQnIGluIGRlc2MgJiYgISgnb3JpZ2luYWxWYWx1ZScgaW4gZGVzYy5nZXQpKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBkZXNjLmdldDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlW3BhcnRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpc093biA9IGhhc093bih2YWx1ZSwgcGFydCk7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWVbcGFydF07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc093biAmJiAhc2tpcEZ1cnRoZXJDYWNoaW5nKSB7XG5cdFx0XHRcdElOVFJJTlNJQ1NbaW50cmluc2ljUmVhbE5hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2YWx1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBvcmlnU3ltYm9sID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sO1xudmFyIGhhc1N5bWJvbFNoYW0gPSByZXF1aXJlKCcuL3NoYW1zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzTmF0aXZlU3ltYm9scygpIHtcblx0aWYgKHR5cGVvZiBvcmlnU3ltYm9sICE9PSAnZnVuY3Rpb24nKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBvcmlnU3ltYm9sKCdmb28nKSAhPT0gJ3N5bWJvbCcpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2YgU3ltYm9sKCdiYXInKSAhPT0gJ3N5bWJvbCcpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0cmV0dXJuIGhhc1N5bWJvbFNoYW0oKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIGVzbGludCBjb21wbGV4aXR5OiBbMiwgMThdLCBtYXgtc3RhdGVtZW50czogWzIsIDMzXSAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoYXNTeW1ib2xzKCkge1xuXHRpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09ICdzeW1ib2wnKSB7IHJldHVybiB0cnVlOyB9XG5cblx0dmFyIG9iaiA9IHt9O1xuXHR2YXIgc3ltID0gU3ltYm9sKCd0ZXN0Jyk7XG5cdHZhciBzeW1PYmogPSBPYmplY3Qoc3ltKTtcblx0aWYgKHR5cGVvZiBzeW0gPT09ICdzdHJpbmcnKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ltKSAhPT0gJ1tvYmplY3QgU3ltYm9sXScpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ltT2JqKSAhPT0gJ1tvYmplY3QgU3ltYm9sXScpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0Ly8gdGVtcCBkaXNhYmxlZCBwZXIgaHR0cHM6Ly9naXRodWIuY29tL2xqaGFyYi9vYmplY3QuYXNzaWduL2lzc3Vlcy8xN1xuXHQvLyBpZiAoc3ltIGluc3RhbmNlb2YgU3ltYm9sKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvLyB0ZW1wIGRpc2FibGVkIHBlciBodHRwczovL2dpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi9nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMvaXNzdWVzLzRcblx0Ly8gaWYgKCEoc3ltT2JqIGluc3RhbmNlb2YgU3ltYm9sKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHQvLyBpZiAodHlwZW9mIFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdC8vIGlmIChTdHJpbmcoc3ltKSAhPT0gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0dmFyIHN5bVZhbCA9IDQyO1xuXHRvYmpbc3ltXSA9IHN5bVZhbDtcblx0Zm9yIChzeW0gaW4gb2JqKSB7IHJldHVybiBmYWxzZTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4LCBuby11bnJlYWNoYWJsZS1sb29wXG5cdGlmICh0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCAhPT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHR2YXIgc3ltcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKTtcblx0aWYgKHN5bXMubGVuZ3RoICE9PSAxIHx8IHN5bXNbMF0gIT09IHN5bSkgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmosIHN5bSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgc3ltKTtcblx0XHRpZiAoZGVzY3JpcHRvci52YWx1ZSAhPT0gc3ltVmFsIHx8IGRlc2NyaXB0b3IuZW51bWVyYWJsZSAhPT0gdHJ1ZSkgeyByZXR1cm4gZmFsc2U7IH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCdmdW5jdGlvbi1iaW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuIiwiLyohIE5hdGl2ZSBQcm9taXNlIE9ubHlcbiAgICB2MC44LjEgKGMpIEt5bGUgU2ltcHNvblxuICAgIE1JVCBMaWNlbnNlOiBodHRwOi8vZ2V0aWZ5Lm1pdC1saWNlbnNlLm9yZ1xuKi9cblxuKGZ1bmN0aW9uIFVNRChuYW1lLGNvbnRleHQsZGVmaW5pdGlvbil7XG5cdC8vIHNwZWNpYWwgZm9ybSBvZiBVTUQgZm9yIHBvbHlmaWxsaW5nIGFjcm9zcyBldmlyb25tZW50c1xuXHRjb250ZXh0W25hbWVdID0gY29udGV4dFtuYW1lXSB8fCBkZWZpbml0aW9uKCk7XG5cdGlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHsgbW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0W25hbWVdOyB9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHsgZGVmaW5lKGZ1bmN0aW9uICRBTUQkKCl7IHJldHVybiBjb250ZXh0W25hbWVdOyB9KTsgfVxufSkoXCJQcm9taXNlXCIsdHlwZW9mIGdsb2JhbCAhPSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdGhpcyxmdW5jdGlvbiBERUYoKXtcblx0Lypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGJ1aWx0SW5Qcm9wLCBjeWNsZSwgc2NoZWR1bGluZ19xdWV1ZSxcblx0XHRUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG5cdFx0dGltZXIgPSAodHlwZW9mIHNldEltbWVkaWF0ZSAhPSBcInVuZGVmaW5lZFwiKSA/XG5cdFx0XHRmdW5jdGlvbiB0aW1lcihmbikgeyByZXR1cm4gc2V0SW1tZWRpYXRlKGZuKTsgfSA6XG5cdFx0XHRzZXRUaW1lb3V0XG5cdDtcblxuXHQvLyBkYW1taXQsIElFOC5cblx0dHJ5IHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sXCJ4XCIse30pO1xuXHRcdGJ1aWx0SW5Qcm9wID0gZnVuY3Rpb24gYnVpbHRJblByb3Aob2JqLG5hbWUsdmFsLGNvbmZpZykge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosbmFtZSx7XG5cdFx0XHRcdHZhbHVlOiB2YWwsXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IGNvbmZpZyAhPT0gZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblx0Y2F0Y2ggKGVycikge1xuXHRcdGJ1aWx0SW5Qcm9wID0gZnVuY3Rpb24gYnVpbHRJblByb3Aob2JqLG5hbWUsdmFsKSB7XG5cdFx0XHRvYmpbbmFtZV0gPSB2YWw7XG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH07XG5cdH1cblxuXHQvLyBOb3RlOiB1c2luZyBhIHF1ZXVlIGluc3RlYWQgb2YgYXJyYXkgZm9yIGVmZmljaWVuY3lcblx0c2NoZWR1bGluZ19xdWV1ZSA9IChmdW5jdGlvbiBRdWV1ZSgpIHtcblx0XHR2YXIgZmlyc3QsIGxhc3QsIGl0ZW07XG5cblx0XHRmdW5jdGlvbiBJdGVtKGZuLHNlbGYpIHtcblx0XHRcdHRoaXMuZm4gPSBmbjtcblx0XHRcdHRoaXMuc2VsZiA9IHNlbGY7XG5cdFx0XHR0aGlzLm5leHQgPSB2b2lkIDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZDogZnVuY3Rpb24gYWRkKGZuLHNlbGYpIHtcblx0XHRcdFx0aXRlbSA9IG5ldyBJdGVtKGZuLHNlbGYpO1xuXHRcdFx0XHRpZiAobGFzdCkge1xuXHRcdFx0XHRcdGxhc3QubmV4dCA9IGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Zmlyc3QgPSBpdGVtO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxhc3QgPSBpdGVtO1xuXHRcdFx0XHRpdGVtID0gdm9pZCAwO1xuXHRcdFx0fSxcblx0XHRcdGRyYWluOiBmdW5jdGlvbiBkcmFpbigpIHtcblx0XHRcdFx0dmFyIGYgPSBmaXJzdDtcblx0XHRcdFx0Zmlyc3QgPSBsYXN0ID0gY3ljbGUgPSB2b2lkIDA7XG5cblx0XHRcdFx0d2hpbGUgKGYpIHtcblx0XHRcdFx0XHRmLmZuLmNhbGwoZi5zZWxmKTtcblx0XHRcdFx0XHRmID0gZi5uZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSkoKTtcblxuXHRmdW5jdGlvbiBzY2hlZHVsZShmbixzZWxmKSB7XG5cdFx0c2NoZWR1bGluZ19xdWV1ZS5hZGQoZm4sc2VsZik7XG5cdFx0aWYgKCFjeWNsZSkge1xuXHRcdFx0Y3ljbGUgPSB0aW1lcihzY2hlZHVsaW5nX3F1ZXVlLmRyYWluKTtcblx0XHR9XG5cdH1cblxuXHQvLyBwcm9taXNlIGR1Y2sgdHlwaW5nXG5cdGZ1bmN0aW9uIGlzVGhlbmFibGUobykge1xuXHRcdHZhciBfdGhlbiwgb190eXBlID0gdHlwZW9mIG87XG5cblx0XHRpZiAobyAhPSBudWxsICYmXG5cdFx0XHQoXG5cdFx0XHRcdG9fdHlwZSA9PSBcIm9iamVjdFwiIHx8IG9fdHlwZSA9PSBcImZ1bmN0aW9uXCJcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdF90aGVuID0gby50aGVuO1xuXHRcdH1cblx0XHRyZXR1cm4gdHlwZW9mIF90aGVuID09IFwiZnVuY3Rpb25cIiA/IF90aGVuIDogZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBub3RpZnkoKSB7XG5cdFx0Zm9yICh2YXIgaT0wOyBpPHRoaXMuY2hhaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdG5vdGlmeUlzb2xhdGVkKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHQodGhpcy5zdGF0ZSA9PT0gMSkgPyB0aGlzLmNoYWluW2ldLnN1Y2Nlc3MgOiB0aGlzLmNoYWluW2ldLmZhaWx1cmUsXG5cdFx0XHRcdHRoaXMuY2hhaW5baV1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdHRoaXMuY2hhaW4ubGVuZ3RoID0gMDtcblx0fVxuXG5cdC8vIE5PVEU6IFRoaXMgaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiB0byBpc29sYXRlXG5cdC8vIHRoZSBgdHJ5Li5jYXRjaGAgc28gdGhhdCBvdGhlciBjb2RlIGNhbiBiZVxuXHQvLyBvcHRpbWl6ZWQgYmV0dGVyXG5cdGZ1bmN0aW9uIG5vdGlmeUlzb2xhdGVkKHNlbGYsY2IsY2hhaW4pIHtcblx0XHR2YXIgcmV0LCBfdGhlbjtcblx0XHR0cnkge1xuXHRcdFx0aWYgKGNiID09PSBmYWxzZSkge1xuXHRcdFx0XHRjaGFpbi5yZWplY3Qoc2VsZi5tc2cpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjYiA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdHJldCA9IHNlbGYubXNnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHJldCA9IGNiLmNhbGwodm9pZCAwLHNlbGYubXNnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChyZXQgPT09IGNoYWluLnByb21pc2UpIHtcblx0XHRcdFx0XHRjaGFpbi5yZWplY3QoVHlwZUVycm9yKFwiUHJvbWlzZS1jaGFpbiBjeWNsZVwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoX3RoZW4gPSBpc1RoZW5hYmxlKHJldCkpIHtcblx0XHRcdFx0XHRfdGhlbi5jYWxsKHJldCxjaGFpbi5yZXNvbHZlLGNoYWluLnJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2hhaW4ucmVzb2x2ZShyZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdGNoYWluLnJlamVjdChlcnIpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlc29sdmUobXNnKSB7XG5cdFx0dmFyIF90aGVuLCBzZWxmID0gdGhpcztcblxuXHRcdC8vIGFscmVhZHkgdHJpZ2dlcmVkP1xuXHRcdGlmIChzZWxmLnRyaWdnZXJlZCkgeyByZXR1cm47IH1cblxuXHRcdHNlbGYudHJpZ2dlcmVkID0gdHJ1ZTtcblxuXHRcdC8vIHVud3JhcFxuXHRcdGlmIChzZWxmLmRlZikge1xuXHRcdFx0c2VsZiA9IHNlbGYuZGVmO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAoX3RoZW4gPSBpc1RoZW5hYmxlKG1zZykpIHtcblx0XHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHR2YXIgZGVmX3dyYXBwZXIgPSBuZXcgTWFrZURlZldyYXBwZXIoc2VsZik7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdF90aGVuLmNhbGwobXNnLFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAkcmVzb2x2ZSQoKXsgcmVzb2x2ZS5hcHBseShkZWZfd3JhcHBlcixhcmd1bWVudHMpOyB9LFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAkcmVqZWN0JCgpeyByZWplY3QuYXBwbHkoZGVmX3dyYXBwZXIsYXJndW1lbnRzKTsgfVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0cmVqZWN0LmNhbGwoZGVmX3dyYXBwZXIsZXJyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c2VsZi5tc2cgPSBtc2c7XG5cdFx0XHRcdHNlbGYuc3RhdGUgPSAxO1xuXHRcdFx0XHRpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0c2NoZWR1bGUobm90aWZ5LHNlbGYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdHJlamVjdC5jYWxsKG5ldyBNYWtlRGVmV3JhcHBlcihzZWxmKSxlcnIpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlamVjdChtc2cpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyBhbHJlYWR5IHRyaWdnZXJlZD9cblx0XHRpZiAoc2VsZi50cmlnZ2VyZWQpIHsgcmV0dXJuOyB9XG5cblx0XHRzZWxmLnRyaWdnZXJlZCA9IHRydWU7XG5cblx0XHQvLyB1bndyYXBcblx0XHRpZiAoc2VsZi5kZWYpIHtcblx0XHRcdHNlbGYgPSBzZWxmLmRlZjtcblx0XHR9XG5cblx0XHRzZWxmLm1zZyA9IG1zZztcblx0XHRzZWxmLnN0YXRlID0gMjtcblx0XHRpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRzY2hlZHVsZShub3RpZnksc2VsZik7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaXRlcmF0ZVByb21pc2VzKENvbnN0cnVjdG9yLGFycixyZXNvbHZlcixyZWplY3Rlcikge1xuXHRcdGZvciAodmFyIGlkeD0wOyBpZHg8YXJyLmxlbmd0aDsgaWR4KyspIHtcblx0XHRcdChmdW5jdGlvbiBJSUZFKGlkeCl7XG5cdFx0XHRcdENvbnN0cnVjdG9yLnJlc29sdmUoYXJyW2lkeF0pXG5cdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdGZ1bmN0aW9uICRyZXNvbHZlciQobXNnKXtcblx0XHRcdFx0XHRcdHJlc29sdmVyKGlkeCxtc2cpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVqZWN0ZXJcblx0XHRcdFx0KTtcblx0XHRcdH0pKGlkeCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gTWFrZURlZldyYXBwZXIoc2VsZikge1xuXHRcdHRoaXMuZGVmID0gc2VsZjtcblx0XHR0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gTWFrZURlZihzZWxmKSB7XG5cdFx0dGhpcy5wcm9taXNlID0gc2VsZjtcblx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHR0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY2hhaW4gPSBbXTtcblx0XHR0aGlzLm1zZyA9IHZvaWQgMDtcblx0fVxuXG5cdGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcblx0XHRpZiAodHlwZW9mIGV4ZWN1dG9yICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX19OUE9fXyAhPT0gMCkge1xuXHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgcHJvbWlzZVwiKTtcblx0XHR9XG5cblx0XHQvLyBpbnN0YW5jZSBzaGFkb3dpbmcgdGhlIGluaGVyaXRlZCBcImJyYW5kXCJcblx0XHQvLyB0byBzaWduYWwgYW4gYWxyZWFkeSBcImluaXRpYWxpemVkXCIgcHJvbWlzZVxuXHRcdHRoaXMuX19OUE9fXyA9IDE7XG5cblx0XHR2YXIgZGVmID0gbmV3IE1ha2VEZWYodGhpcyk7XG5cblx0XHR0aGlzW1widGhlblwiXSA9IGZ1bmN0aW9uIHRoZW4oc3VjY2VzcyxmYWlsdXJlKSB7XG5cdFx0XHR2YXIgbyA9IHtcblx0XHRcdFx0c3VjY2VzczogdHlwZW9mIHN1Y2Nlc3MgPT0gXCJmdW5jdGlvblwiID8gc3VjY2VzcyA6IHRydWUsXG5cdFx0XHRcdGZhaWx1cmU6IHR5cGVvZiBmYWlsdXJlID09IFwiZnVuY3Rpb25cIiA/IGZhaWx1cmUgOiBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdC8vIE5vdGU6IGB0aGVuKC4uKWAgaXRzZWxmIGNhbiBiZSBib3Jyb3dlZCB0byBiZSB1c2VkIGFnYWluc3Rcblx0XHRcdC8vIGEgZGlmZmVyZW50IHByb21pc2UgY29uc3RydWN0b3IgZm9yIG1ha2luZyB0aGUgY2hhaW5lZCBwcm9taXNlLFxuXHRcdFx0Ly8gYnkgc3Vic3RpdHV0aW5nIGEgZGlmZmVyZW50IGB0aGlzYCBiaW5kaW5nLlxuXHRcdFx0by5wcm9taXNlID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZnVuY3Rpb24gZXh0cmFjdENoYWluKHJlc29sdmUscmVqZWN0KSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG8ucmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0XHRcdG8ucmVqZWN0ID0gcmVqZWN0O1xuXHRcdFx0fSk7XG5cdFx0XHRkZWYuY2hhaW4ucHVzaChvKTtcblxuXHRcdFx0aWYgKGRlZi5zdGF0ZSAhPT0gMCkge1xuXHRcdFx0XHRzY2hlZHVsZShub3RpZnksZGVmKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG8ucHJvbWlzZTtcblx0XHR9O1xuXHRcdHRoaXNbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uICRjYXRjaCQoZmFpbHVyZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbih2b2lkIDAsZmFpbHVyZSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRleGVjdXRvci5jYWxsKFxuXHRcdFx0XHR2b2lkIDAsXG5cdFx0XHRcdGZ1bmN0aW9uIHB1YmxpY1Jlc29sdmUobXNnKXtcblx0XHRcdFx0XHRyZXNvbHZlLmNhbGwoZGVmLG1zZyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uIHB1YmxpY1JlamVjdChtc2cpIHtcblx0XHRcdFx0XHRyZWplY3QuY2FsbChkZWYsbXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0cmVqZWN0LmNhbGwoZGVmLGVycik7XG5cdFx0fVxuXHR9XG5cblx0dmFyIFByb21pc2VQcm90b3R5cGUgPSBidWlsdEluUHJvcCh7fSxcImNvbnN0cnVjdG9yXCIsUHJvbWlzZSxcblx0XHQvKmNvbmZpZ3VyYWJsZT0qL2ZhbHNlXG5cdCk7XG5cblx0Ly8gTm90ZTogQW5kcm9pZCA0IGNhbm5vdCB1c2UgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSguLilgIGhlcmVcblx0UHJvbWlzZS5wcm90b3R5cGUgPSBQcm9taXNlUHJvdG90eXBlO1xuXG5cdC8vIGJ1aWx0LWluIFwiYnJhbmRcIiB0byBzaWduYWwgYW4gXCJ1bmluaXRpYWxpemVkXCIgcHJvbWlzZVxuXHRidWlsdEluUHJvcChQcm9taXNlUHJvdG90eXBlLFwiX19OUE9fX1wiLDAsXG5cdFx0Lypjb25maWd1cmFibGU9Ki9mYWxzZVxuXHQpO1xuXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2UsXCJyZXNvbHZlXCIsZnVuY3Rpb24gUHJvbWlzZSRyZXNvbHZlKG1zZykge1xuXHRcdHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cblx0XHQvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuXHRcdC8vIG5vdGU6IGJlc3QgXCJpc1Byb21pc2VcIiBjaGVjayB0aGF0J3MgcHJhY3RpY2FsIGZvciBub3dcblx0XHRpZiAobXNnICYmIHR5cGVvZiBtc2cgPT0gXCJvYmplY3RcIiAmJiBtc2cuX19OUE9fXyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIG1zZztcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdHJlc29sdmUobXNnKTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcInJlamVjdFwiLGZ1bmN0aW9uIFByb21pc2UkcmVqZWN0KG1zZykge1xuXHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWplY3QobXNnKTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcImFsbFwiLGZ1bmN0aW9uIFByb21pc2UkYWxsKGFycikge1xuXHRcdHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cblx0XHQvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuXHRcdGlmIChUb1N0cmluZy5jYWxsKGFycikgIT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG5cdFx0XHRyZXR1cm4gQ29uc3RydWN0b3IucmVqZWN0KFR5cGVFcnJvcihcIk5vdCBhbiBhcnJheVwiKSk7XG5cdFx0fVxuXHRcdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gQ29uc3RydWN0b3IucmVzb2x2ZShbXSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbGVuID0gYXJyLmxlbmd0aCwgbXNncyA9IEFycmF5KGxlbiksIGNvdW50ID0gMDtcblxuXHRcdFx0aXRlcmF0ZVByb21pc2VzKENvbnN0cnVjdG9yLGFycixmdW5jdGlvbiByZXNvbHZlcihpZHgsbXNnKSB7XG5cdFx0XHRcdG1zZ3NbaWR4XSA9IG1zZztcblx0XHRcdFx0aWYgKCsrY291bnQgPT09IGxlbikge1xuXHRcdFx0XHRcdHJlc29sdmUobXNncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0scmVqZWN0KTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcInJhY2VcIixmdW5jdGlvbiBQcm9taXNlJHJhY2UoYXJyKSB7XG5cdFx0dmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuXHRcdC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG5cdFx0aWYgKFRvU3RyaW5nLmNhbGwoYXJyKSAhPSBcIltvYmplY3QgQXJyYXldXCIpIHtcblx0XHRcdHJldHVybiBDb25zdHJ1Y3Rvci5yZWplY3QoVHlwZUVycm9yKFwiTm90IGFuIGFycmF5XCIpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdGl0ZXJhdGVQcm9taXNlcyhDb25zdHJ1Y3RvcixhcnIsZnVuY3Rpb24gcmVzb2x2ZXIoaWR4LG1zZyl7XG5cdFx0XHRcdHJlc29sdmUobXNnKTtcblx0XHRcdH0scmVqZWN0KTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2U7XG59KTtcbiIsInZhciBoYXNNYXAgPSB0eXBlb2YgTWFwID09PSAnZnVuY3Rpb24nICYmIE1hcC5wcm90b3R5cGU7XG52YXIgbWFwU2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc01hcCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTWFwLnByb3RvdHlwZSwgJ3NpemUnKSA6IG51bGw7XG52YXIgbWFwU2l6ZSA9IGhhc01hcCAmJiBtYXBTaXplRGVzY3JpcHRvciAmJiB0eXBlb2YgbWFwU2l6ZURlc2NyaXB0b3IuZ2V0ID09PSAnZnVuY3Rpb24nID8gbWFwU2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcbnZhciBtYXBGb3JFYWNoID0gaGFzTWFwICYmIE1hcC5wcm90b3R5cGUuZm9yRWFjaDtcbnZhciBoYXNTZXQgPSB0eXBlb2YgU2V0ID09PSAnZnVuY3Rpb24nICYmIFNldC5wcm90b3R5cGU7XG52YXIgc2V0U2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc1NldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoU2V0LnByb3RvdHlwZSwgJ3NpemUnKSA6IG51bGw7XG52YXIgc2V0U2l6ZSA9IGhhc1NldCAmJiBzZXRTaXplRGVzY3JpcHRvciAmJiB0eXBlb2Ygc2V0U2l6ZURlc2NyaXB0b3IuZ2V0ID09PSAnZnVuY3Rpb24nID8gc2V0U2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcbnZhciBzZXRGb3JFYWNoID0gaGFzU2V0ICYmIFNldC5wcm90b3R5cGUuZm9yRWFjaDtcbnZhciBoYXNXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgV2Vha01hcC5wcm90b3R5cGU7XG52YXIgd2Vha01hcEhhcyA9IGhhc1dlYWtNYXAgPyBXZWFrTWFwLnByb3RvdHlwZS5oYXMgOiBudWxsO1xudmFyIGhhc1dlYWtTZXQgPSB0eXBlb2YgV2Vha1NldCA9PT0gJ2Z1bmN0aW9uJyAmJiBXZWFrU2V0LnByb3RvdHlwZTtcbnZhciB3ZWFrU2V0SGFzID0gaGFzV2Vha1NldCA/IFdlYWtTZXQucHJvdG90eXBlLmhhcyA6IG51bGw7XG52YXIgaGFzV2Vha1JlZiA9IHR5cGVvZiBXZWFrUmVmID09PSAnZnVuY3Rpb24nICYmIFdlYWtSZWYucHJvdG90eXBlO1xudmFyIHdlYWtSZWZEZXJlZiA9IGhhc1dlYWtSZWYgPyBXZWFrUmVmLnByb3RvdHlwZS5kZXJlZiA6IG51bGw7XG52YXIgYm9vbGVhblZhbHVlT2YgPSBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mO1xudmFyIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyICRtYXRjaCA9IFN0cmluZy5wcm90b3R5cGUubWF0Y2g7XG52YXIgJHNsaWNlID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZTtcbnZhciAkcmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcbnZhciAkdG9VcHBlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvVXBwZXJDYXNlO1xudmFyICR0b0xvd2VyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2U7XG52YXIgJHRlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XG52YXIgJGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG52YXIgJGpvaW4gPSBBcnJheS5wcm90b3R5cGUuam9pbjtcbnZhciAkYXJyU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgJGZsb29yID0gTWF0aC5mbG9vcjtcbnZhciBiaWdJbnRWYWx1ZU9mID0gdHlwZW9mIEJpZ0ludCA9PT0gJ2Z1bmN0aW9uJyA/IEJpZ0ludC5wcm90b3R5cGUudmFsdWVPZiA6IG51bGw7XG52YXIgZ09QUyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgc3ltVG9TdHJpbmcgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09ICdzeW1ib2wnID8gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZyA6IG51bGw7XG52YXIgaGFzU2hhbW1lZFN5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09ICdvYmplY3QnO1xuLy8gaWUsIGBoYXMtdG9zdHJpbmd0YWcvc2hhbXNcbnZhciB0b1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLnRvU3RyaW5nVGFnICYmICh0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSBoYXNTaGFtbWVkU3ltYm9scyA/ICdvYmplY3QnIDogJ3N5bWJvbCcpXG4gICAgPyBTeW1ib2wudG9TdHJpbmdUYWdcbiAgICA6IG51bGw7XG52YXIgaXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxudmFyIGdQTyA9ICh0eXBlb2YgUmVmbGVjdCA9PT0gJ2Z1bmN0aW9uJyA/IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YgOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHx8IChcbiAgICBbXS5fX3Byb3RvX18gPT09IEFycmF5LnByb3RvdHlwZSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvXG4gICAgICAgID8gZnVuY3Rpb24gKE8pIHtcbiAgICAgICAgICAgIHJldHVybiBPLl9fcHJvdG9fXzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b1xuICAgICAgICB9XG4gICAgICAgIDogbnVsbFxuKTtcblxuZnVuY3Rpb24gYWRkTnVtZXJpY1NlcGFyYXRvcihudW0sIHN0cikge1xuICAgIGlmIChcbiAgICAgICAgbnVtID09PSBJbmZpbml0eVxuICAgICAgICB8fCBudW0gPT09IC1JbmZpbml0eVxuICAgICAgICB8fCBudW0gIT09IG51bVxuICAgICAgICB8fCAobnVtICYmIG51bSA+IC0xMDAwICYmIG51bSA8IDEwMDApXG4gICAgICAgIHx8ICR0ZXN0LmNhbGwoL2UvLCBzdHIpXG4gICAgKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIHZhciBzZXBSZWdleCA9IC9bMC05XSg/PSg/OlswLTldezN9KSsoPyFbMC05XSkpL2c7XG4gICAgaWYgKHR5cGVvZiBudW0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciBpbnQgPSBudW0gPCAwID8gLSRmbG9vcigtbnVtKSA6ICRmbG9vcihudW0pOyAvLyB0cnVuYyhudW0pXG4gICAgICAgIGlmIChpbnQgIT09IG51bSkge1xuICAgICAgICAgICAgdmFyIGludFN0ciA9IFN0cmluZyhpbnQpO1xuICAgICAgICAgICAgdmFyIGRlYyA9ICRzbGljZS5jYWxsKHN0ciwgaW50U3RyLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoaW50U3RyLCBzZXBSZWdleCwgJyQmXycpICsgJy4nICsgJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKGRlYywgLyhbMC05XXszfSkvZywgJyQmXycpLCAvXyQvLCAnJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoc3RyLCBzZXBSZWdleCwgJyQmXycpO1xufVxuXG52YXIgdXRpbEluc3BlY3QgPSByZXF1aXJlKCcuL3V0aWwuaW5zcGVjdCcpO1xudmFyIGluc3BlY3RDdXN0b20gPSB1dGlsSW5zcGVjdC5jdXN0b207XG52YXIgaW5zcGVjdFN5bWJvbCA9IGlzU3ltYm9sKGluc3BlY3RDdXN0b20pID8gaW5zcGVjdEN1c3RvbSA6IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zcGVjdF8ob2JqLCBvcHRpb25zLCBkZXB0aCwgc2Vlbikge1xuICAgIHZhciBvcHRzID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIGlmIChoYXMob3B0cywgJ3F1b3RlU3R5bGUnKSAmJiAob3B0cy5xdW90ZVN0eWxlICE9PSAnc2luZ2xlJyAmJiBvcHRzLnF1b3RlU3R5bGUgIT09ICdkb3VibGUnKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJxdW90ZVN0eWxlXCIgbXVzdCBiZSBcInNpbmdsZVwiIG9yIFwiZG91YmxlXCInKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgICBoYXMob3B0cywgJ21heFN0cmluZ0xlbmd0aCcpICYmICh0eXBlb2Ygb3B0cy5tYXhTdHJpbmdMZW5ndGggPT09ICdudW1iZXInXG4gICAgICAgICAgICA/IG9wdHMubWF4U3RyaW5nTGVuZ3RoIDwgMCAmJiBvcHRzLm1heFN0cmluZ0xlbmd0aCAhPT0gSW5maW5pdHlcbiAgICAgICAgICAgIDogb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IG51bGxcbiAgICAgICAgKVxuICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJtYXhTdHJpbmdMZW5ndGhcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBJbmZpbml0eSwgb3IgYG51bGxgJyk7XG4gICAgfVxuICAgIHZhciBjdXN0b21JbnNwZWN0ID0gaGFzKG9wdHMsICdjdXN0b21JbnNwZWN0JykgPyBvcHRzLmN1c3RvbUluc3BlY3QgOiB0cnVlO1xuICAgIGlmICh0eXBlb2YgY3VzdG9tSW5zcGVjdCAhPT0gJ2Jvb2xlYW4nICYmIGN1c3RvbUluc3BlY3QgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcImN1c3RvbUluc3BlY3RcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgLCBgZmFsc2VgLCBvciBgXFwnc3ltYm9sXFwnYCcpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICAgaGFzKG9wdHMsICdpbmRlbnQnKVxuICAgICAgICAmJiBvcHRzLmluZGVudCAhPT0gbnVsbFxuICAgICAgICAmJiBvcHRzLmluZGVudCAhPT0gJ1xcdCdcbiAgICAgICAgJiYgIShwYXJzZUludChvcHRzLmluZGVudCwgMTApID09PSBvcHRzLmluZGVudCAmJiBvcHRzLmluZGVudCA+IDApXG4gICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcImluZGVudFwiIG11c3QgYmUgXCJcXFxcdFwiLCBhbiBpbnRlZ2VyID4gMCwgb3IgYG51bGxgJyk7XG4gICAgfVxuICAgIGlmIChoYXMob3B0cywgJ251bWVyaWNTZXBhcmF0b3InKSAmJiB0eXBlb2Ygb3B0cy5udW1lcmljU2VwYXJhdG9yICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibnVtZXJpY1NlcGFyYXRvclwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAgb3IgYGZhbHNlYCcpO1xuICAgIH1cbiAgICB2YXIgbnVtZXJpY1NlcGFyYXRvciA9IG9wdHMubnVtZXJpY1NlcGFyYXRvcjtcblxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gICAgfVxuICAgIGlmIChvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdib29sZWFuJykge1xuICAgICAgICByZXR1cm4gb2JqID8gJ3RydWUnIDogJ2ZhbHNlJztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcob2JqLCBvcHRzKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChvYmogPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBJbmZpbml0eSAvIG9iaiA+IDAgPyAnMCcgOiAnLTAnO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHIgPSBTdHJpbmcob2JqKTtcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgc3RyKSA6IHN0cjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdiaWdpbnQnKSB7XG4gICAgICAgIHZhciBiaWdJbnRTdHIgPSBTdHJpbmcob2JqKSArICduJztcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgYmlnSW50U3RyKSA6IGJpZ0ludFN0cjtcbiAgICB9XG5cbiAgICB2YXIgbWF4RGVwdGggPSB0eXBlb2Ygb3B0cy5kZXB0aCA9PT0gJ3VuZGVmaW5lZCcgPyA1IDogb3B0cy5kZXB0aDtcbiAgICBpZiAodHlwZW9mIGRlcHRoID09PSAndW5kZWZpbmVkJykgeyBkZXB0aCA9IDA7IH1cbiAgICBpZiAoZGVwdGggPj0gbWF4RGVwdGggJiYgbWF4RGVwdGggPiAwICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBpc0FycmF5KG9iaikgPyAnW0FycmF5XScgOiAnW09iamVjdF0nO1xuICAgIH1cblxuICAgIHZhciBpbmRlbnQgPSBnZXRJbmRlbnQob3B0cywgZGVwdGgpO1xuXG4gICAgaWYgKHR5cGVvZiBzZWVuID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzZWVuID0gW107XG4gICAgfSBlbHNlIGlmIChpbmRleE9mKHNlZW4sIG9iaikgPj0gMCkge1xuICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3BlY3QodmFsdWUsIGZyb20sIG5vSW5kZW50KSB7XG4gICAgICAgIGlmIChmcm9tKSB7XG4gICAgICAgICAgICBzZWVuID0gJGFyclNsaWNlLmNhbGwoc2Vlbik7XG4gICAgICAgICAgICBzZWVuLnB1c2goZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vSW5kZW50KSB7XG4gICAgICAgICAgICB2YXIgbmV3T3B0cyA9IHtcbiAgICAgICAgICAgICAgICBkZXB0aDogb3B0cy5kZXB0aFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChoYXMob3B0cywgJ3F1b3RlU3R5bGUnKSkge1xuICAgICAgICAgICAgICAgIG5ld09wdHMucXVvdGVTdHlsZSA9IG9wdHMucXVvdGVTdHlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgbmV3T3B0cywgZGVwdGggKyAxLCBzZWVuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zcGVjdF8odmFsdWUsIG9wdHMsIGRlcHRoICsgMSwgc2Vlbik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicgJiYgIWlzUmVnRXhwKG9iaikpIHsgLy8gaW4gb2xkZXIgZW5naW5lcywgcmVnZXhlcyBhcmUgY2FsbGFibGVcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lT2Yob2JqKTtcbiAgICAgICAgdmFyIGtleXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdCk7XG4gICAgICAgIHJldHVybiAnW0Z1bmN0aW9uJyArIChuYW1lID8gJzogJyArIG5hbWUgOiAnIChhbm9ueW1vdXMpJykgKyAnXScgKyAoa2V5cy5sZW5ndGggPiAwID8gJyB7ICcgKyAkam9pbi5jYWxsKGtleXMsICcsICcpICsgJyB9JyA6ICcnKTtcbiAgICB9XG4gICAgaWYgKGlzU3ltYm9sKG9iaikpIHtcbiAgICAgICAgdmFyIHN5bVN0cmluZyA9IGhhc1NoYW1tZWRTeW1ib2xzID8gJHJlcGxhY2UuY2FsbChTdHJpbmcob2JqKSwgL14oU3ltYm9sXFwoLipcXCkpX1teKV0qJC8sICckMScpIDogc3ltVG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgIWhhc1NoYW1tZWRTeW1ib2xzID8gbWFya0JveGVkKHN5bVN0cmluZykgOiBzeW1TdHJpbmc7XG4gICAgfVxuICAgIGlmIChpc0VsZW1lbnQob2JqKSkge1xuICAgICAgICB2YXIgcyA9ICc8JyArICR0b0xvd2VyQ2FzZS5jYWxsKFN0cmluZyhvYmoubm9kZU5hbWUpKTtcbiAgICAgICAgdmFyIGF0dHJzID0gb2JqLmF0dHJpYnV0ZXMgfHwgW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHMgKz0gJyAnICsgYXR0cnNbaV0ubmFtZSArICc9JyArIHdyYXBRdW90ZXMocXVvdGUoYXR0cnNbaV0udmFsdWUpLCAnZG91YmxlJywgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSAnPic7XG4gICAgICAgIGlmIChvYmouY2hpbGROb2RlcyAmJiBvYmouY2hpbGROb2Rlcy5sZW5ndGgpIHsgcyArPSAnLi4uJzsgfVxuICAgICAgICBzICs9ICc8LycgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSkgKyAnPic7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGlmIChvYmoubGVuZ3RoID09PSAwKSB7IHJldHVybiAnW10nOyB9XG4gICAgICAgIHZhciB4cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0KTtcbiAgICAgICAgaWYgKGluZGVudCAmJiAhc2luZ2xlTGluZVZhbHVlcyh4cykpIHtcbiAgICAgICAgICAgIHJldHVybiAnWycgKyBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkgKyAnXSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdbICcgKyAkam9pbi5jYWxsKHhzLCAnLCAnKSArICcgXSc7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKG9iaikpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QpO1xuICAgICAgICBpZiAoISgnY2F1c2UnIGluIEVycm9yLnByb3RvdHlwZSkgJiYgJ2NhdXNlJyBpbiBvYmogJiYgIWlzRW51bWVyYWJsZS5jYWxsKG9iaiwgJ2NhdXNlJykpIHtcbiAgICAgICAgICAgIHJldHVybiAneyBbJyArIFN0cmluZyhvYmopICsgJ10gJyArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKCdbY2F1c2VdOiAnICsgaW5zcGVjdChvYmouY2F1c2UpLCBwYXJ0cyksICcsICcpICsgJyB9JztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSB7IHJldHVybiAnWycgKyBTdHJpbmcob2JqKSArICddJzsgfVxuICAgICAgICByZXR1cm4gJ3sgWycgKyBTdHJpbmcob2JqKSArICddICcgKyAkam9pbi5jYWxsKHBhcnRzLCAnLCAnKSArICcgfSc7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBjdXN0b21JbnNwZWN0KSB7XG4gICAgICAgIGlmIChpbnNwZWN0U3ltYm9sICYmIHR5cGVvZiBvYmpbaW5zcGVjdFN5bWJvbF0gPT09ICdmdW5jdGlvbicgJiYgdXRpbEluc3BlY3QpIHtcbiAgICAgICAgICAgIHJldHVybiB1dGlsSW5zcGVjdChvYmosIHsgZGVwdGg6IG1heERlcHRoIC0gZGVwdGggfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tSW5zcGVjdCAhPT0gJ3N5bWJvbCcgJiYgdHlwZW9mIG9iai5pbnNwZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqLmluc3BlY3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNNYXAob2JqKSkge1xuICAgICAgICB2YXIgbWFwUGFydHMgPSBbXTtcbiAgICAgICAgbWFwRm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIG1hcFBhcnRzLnB1c2goaW5zcGVjdChrZXksIG9iaiwgdHJ1ZSkgKyAnID0+ICcgKyBpbnNwZWN0KHZhbHVlLCBvYmopKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoJ01hcCcsIG1hcFNpemUuY2FsbChvYmopLCBtYXBQYXJ0cywgaW5kZW50KTtcbiAgICB9XG4gICAgaWYgKGlzU2V0KG9iaikpIHtcbiAgICAgICAgdmFyIHNldFBhcnRzID0gW107XG4gICAgICAgIHNldEZvckVhY2guY2FsbChvYmosIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc2V0UGFydHMucHVzaChpbnNwZWN0KHZhbHVlLCBvYmopKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoJ1NldCcsIHNldFNpemUuY2FsbChvYmopLCBzZXRQYXJ0cywgaW5kZW50KTtcbiAgICB9XG4gICAgaWYgKGlzV2Vha01hcChvYmopKSB7XG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKCdXZWFrTWFwJyk7XG4gICAgfVxuICAgIGlmIChpc1dlYWtTZXQob2JqKSkge1xuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZignV2Vha1NldCcpO1xuICAgIH1cbiAgICBpZiAoaXNXZWFrUmVmKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoJ1dlYWtSZWYnKTtcbiAgICB9XG4gICAgaWYgKGlzTnVtYmVyKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0KE51bWJlcihvYmopKSk7XG4gICAgfVxuICAgIGlmIChpc0JpZ0ludChvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdChiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKSkpO1xuICAgIH1cbiAgICBpZiAoaXNCb29sZWFuKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChib29sZWFuVmFsdWVPZi5jYWxsKG9iaikpO1xuICAgIH1cbiAgICBpZiAoaXNTdHJpbmcob2JqKSkge1xuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QoU3RyaW5nKG9iaikpKTtcbiAgICB9XG4gICAgaWYgKCFpc0RhdGUob2JqKSAmJiAhaXNSZWdFeHAob2JqKSkge1xuICAgICAgICB2YXIgeXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdCk7XG4gICAgICAgIHZhciBpc1BsYWluT2JqZWN0ID0gZ1BPID8gZ1BPKG9iaikgPT09IE9iamVjdC5wcm90b3R5cGUgOiBvYmogaW5zdGFuY2VvZiBPYmplY3QgfHwgb2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG4gICAgICAgIHZhciBwcm90b1RhZyA9IG9iaiBpbnN0YW5jZW9mIE9iamVjdCA/ICcnIDogJ251bGwgcHJvdG90eXBlJztcbiAgICAgICAgdmFyIHN0cmluZ1RhZyA9ICFpc1BsYWluT2JqZWN0ICYmIHRvU3RyaW5nVGFnICYmIE9iamVjdChvYmopID09PSBvYmogJiYgdG9TdHJpbmdUYWcgaW4gb2JqID8gJHNsaWNlLmNhbGwodG9TdHIob2JqKSwgOCwgLTEpIDogcHJvdG9UYWcgPyAnT2JqZWN0JyA6ICcnO1xuICAgICAgICB2YXIgY29uc3RydWN0b3JUYWcgPSBpc1BsYWluT2JqZWN0IHx8IHR5cGVvZiBvYmouY29uc3RydWN0b3IgIT09ICdmdW5jdGlvbicgPyAnJyA6IG9iai5jb25zdHJ1Y3Rvci5uYW1lID8gb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnICcgOiAnJztcbiAgICAgICAgdmFyIHRhZyA9IGNvbnN0cnVjdG9yVGFnICsgKHN0cmluZ1RhZyB8fCBwcm90b1RhZyA/ICdbJyArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKFtdLCBzdHJpbmdUYWcgfHwgW10sIHByb3RvVGFnIHx8IFtdKSwgJzogJykgKyAnXSAnIDogJycpO1xuICAgICAgICBpZiAoeXMubGVuZ3RoID09PSAwKSB7IHJldHVybiB0YWcgKyAne30nOyB9XG4gICAgICAgIGlmIChpbmRlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YWcgKyAneycgKyBpbmRlbnRlZEpvaW4oeXMsIGluZGVudCkgKyAnfSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZyArICd7ICcgKyAkam9pbi5jYWxsKHlzLCAnLCAnKSArICcgfSc7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcob2JqKTtcbn07XG5cbmZ1bmN0aW9uIHdyYXBRdW90ZXMocywgZGVmYXVsdFN0eWxlLCBvcHRzKSB7XG4gICAgdmFyIHF1b3RlQ2hhciA9IChvcHRzLnF1b3RlU3R5bGUgfHwgZGVmYXVsdFN0eWxlKSA9PT0gJ2RvdWJsZScgPyAnXCInIDogXCInXCI7XG4gICAgcmV0dXJuIHF1b3RlQ2hhciArIHMgKyBxdW90ZUNoYXI7XG59XG5cbmZ1bmN0aW9uIHF1b3RlKHMpIHtcbiAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChTdHJpbmcocyksIC9cIi9nLCAnJnF1b3Q7Jyk7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7IHJldHVybiB0b1N0cihvYmopID09PSAnW29iamVjdCBBcnJheV0nICYmICghdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0b1N0cmluZ1RhZyBpbiBvYmopKTsgfVxuZnVuY3Rpb24gaXNEYXRlKG9iaikgeyByZXR1cm4gdG9TdHIob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nICYmICghdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0b1N0cmluZ1RhZyBpbiBvYmopKTsgfVxuZnVuY3Rpb24gaXNSZWdFeHAob2JqKSB7IHJldHVybiB0b1N0cihvYmopID09PSAnW29iamVjdCBSZWdFeHBdJyAmJiAoIXRvU3RyaW5nVGFnIHx8ICEodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmdUYWcgaW4gb2JqKSk7IH1cbmZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7IHJldHVybiB0b1N0cihvYmopID09PSAnW29iamVjdCBFcnJvcl0nICYmICghdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0b1N0cmluZ1RhZyBpbiBvYmopKTsgfVxuZnVuY3Rpb24gaXNTdHJpbmcob2JqKSB7IHJldHVybiB0b1N0cihvYmopID09PSAnW29iamVjdCBTdHJpbmddJyAmJiAoIXRvU3RyaW5nVGFnIHx8ICEodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmdUYWcgaW4gb2JqKSk7IH1cbmZ1bmN0aW9uIGlzTnVtYmVyKG9iaikgeyByZXR1cm4gdG9TdHIob2JqKSA9PT0gJ1tvYmplY3QgTnVtYmVyXScgJiYgKCF0b1N0cmluZ1RhZyB8fCAhKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nVGFnIGluIG9iaikpOyB9XG5mdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKSB7IHJldHVybiB0b1N0cihvYmopID09PSAnW29iamVjdCBCb29sZWFuXScgJiYgKCF0b1N0cmluZ1RhZyB8fCAhKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHRvU3RyaW5nVGFnIGluIG9iaikpOyB9XG5cbi8vIFN5bWJvbCBhbmQgQmlnSW50IGRvIGhhdmUgU3ltYm9sLnRvU3RyaW5nVGFnIGJ5IHNwZWMsIHNvIHRoYXQgY2FuJ3QgYmUgdXNlZCB0byBlbGltaW5hdGUgZmFsc2UgcG9zaXRpdmVzXG5mdW5jdGlvbiBpc1N5bWJvbChvYmopIHtcbiAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMpIHtcbiAgICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogaW5zdGFuY2VvZiBTeW1ib2w7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3ltYm9sJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgIXN5bVRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgc3ltVG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNCaWdJbnQob2JqKSB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgIWJpZ0ludFZhbHVlT2YpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5IHx8IGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIGtleSBpbiB0aGlzOyB9O1xuZnVuY3Rpb24gaGFzKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn1cblxuZnVuY3Rpb24gdG9TdHIob2JqKSB7XG4gICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqKTtcbn1cblxuZnVuY3Rpb24gbmFtZU9mKGYpIHtcbiAgICBpZiAoZi5uYW1lKSB7IHJldHVybiBmLm5hbWU7IH1cbiAgICB2YXIgbSA9ICRtYXRjaC5jYWxsKGZ1bmN0aW9uVG9TdHJpbmcuY2FsbChmKSwgL15mdW5jdGlvblxccyooW1xcdyRdKykvKTtcbiAgICBpZiAobSkgeyByZXR1cm4gbVsxXTsgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpbmRleE9mKHhzLCB4KSB7XG4gICAgaWYgKHhzLmluZGV4T2YpIHsgcmV0dXJuIHhzLmluZGV4T2YoeCk7IH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoeHNbaV0gPT09IHgpIHsgcmV0dXJuIGk7IH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBpc01hcCh4KSB7XG4gICAgaWYgKCFtYXBTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIG1hcFNpemUuY2FsbCh4KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFNpemUuY2FsbCh4KTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBNYXA7IC8vIGNvcmUtanMgd29ya2Fyb3VuZCwgcHJlLXYyLjUuMFxuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1dlYWtNYXAoeCkge1xuICAgIGlmICghd2Vha01hcEhhcyB8fCAheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha01hcDsgLy8gY29yZS1qcyB3b3JrYXJvdW5kLCBwcmUtdjIuNS4wXG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzV2Vha1JlZih4KSB7XG4gICAgaWYgKCF3ZWFrUmVmRGVyZWYgfHwgIXggfHwgdHlwZW9mIHggIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgd2Vha1JlZkRlcmVmLmNhbGwoeCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1NldCh4KSB7XG4gICAgaWYgKCFzZXRTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHNldFNpemUuY2FsbCh4KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1hcFNpemUuY2FsbCh4KTtcbiAgICAgICAgfSBjYXRjaCAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBTZXQ7IC8vIGNvcmUtanMgd29ya2Fyb3VuZCwgcHJlLXYyLjUuMFxuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1dlYWtTZXQoeCkge1xuICAgIGlmICghd2Vha1NldEhhcyB8fCAheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha1NldDsgLy8gY29yZS1qcyB3b3JrYXJvdW5kLCBwcmUtdjIuNS4wXG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudCh4KSB7XG4gICAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAodHlwZW9mIEhUTUxFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiB4IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgeC5ub2RlTmFtZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHguZ2V0QXR0cmlidXRlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpbnNwZWN0U3RyaW5nKHN0ciwgb3B0cykge1xuICAgIGlmIChzdHIubGVuZ3RoID4gb3B0cy5tYXhTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHN0ci5sZW5ndGggLSBvcHRzLm1heFN0cmluZ0xlbmd0aDtcbiAgICAgICAgdmFyIHRyYWlsZXIgPSAnLi4uICcgKyByZW1haW5pbmcgKyAnIG1vcmUgY2hhcmFjdGVyJyArIChyZW1haW5pbmcgPiAxID8gJ3MnIDogJycpO1xuICAgICAgICByZXR1cm4gaW5zcGVjdFN0cmluZygkc2xpY2UuY2FsbChzdHIsIDAsIG9wdHMubWF4U3RyaW5nTGVuZ3RoKSwgb3B0cykgKyB0cmFpbGVyO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuICAgIHZhciBzID0gJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKHN0ciwgLyhbJ1xcXFxdKS9nLCAnXFxcXCQxJyksIC9bXFx4MDAtXFx4MWZdL2csIGxvd2J5dGUpO1xuICAgIHJldHVybiB3cmFwUXVvdGVzKHMsICdzaW5nbGUnLCBvcHRzKTtcbn1cblxuZnVuY3Rpb24gbG93Ynl0ZShjKSB7XG4gICAgdmFyIG4gPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIHggPSB7XG4gICAgICAgIDg6ICdiJyxcbiAgICAgICAgOTogJ3QnLFxuICAgICAgICAxMDogJ24nLFxuICAgICAgICAxMjogJ2YnLFxuICAgICAgICAxMzogJ3InXG4gICAgfVtuXTtcbiAgICBpZiAoeCkgeyByZXR1cm4gJ1xcXFwnICsgeDsgfVxuICAgIHJldHVybiAnXFxcXHgnICsgKG4gPCAweDEwID8gJzAnIDogJycpICsgJHRvVXBwZXJDYXNlLmNhbGwobi50b1N0cmluZygxNikpO1xufVxuXG5mdW5jdGlvbiBtYXJrQm94ZWQoc3RyKSB7XG4gICAgcmV0dXJuICdPYmplY3QoJyArIHN0ciArICcpJztcbn1cblxuZnVuY3Rpb24gd2Vha0NvbGxlY3Rpb25PZih0eXBlKSB7XG4gICAgcmV0dXJuIHR5cGUgKyAnIHsgPyB9Jztcbn1cblxuZnVuY3Rpb24gY29sbGVjdGlvbk9mKHR5cGUsIHNpemUsIGVudHJpZXMsIGluZGVudCkge1xuICAgIHZhciBqb2luZWRFbnRyaWVzID0gaW5kZW50ID8gaW5kZW50ZWRKb2luKGVudHJpZXMsIGluZGVudCkgOiAkam9pbi5jYWxsKGVudHJpZXMsICcsICcpO1xuICAgIHJldHVybiB0eXBlICsgJyAoJyArIHNpemUgKyAnKSB7JyArIGpvaW5lZEVudHJpZXMgKyAnfSc7XG59XG5cbmZ1bmN0aW9uIHNpbmdsZUxpbmVWYWx1ZXMoeHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpbmRleE9mKHhzW2ldLCAnXFxuJykgPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBnZXRJbmRlbnQob3B0cywgZGVwdGgpIHtcbiAgICB2YXIgYmFzZUluZGVudDtcbiAgICBpZiAob3B0cy5pbmRlbnQgPT09ICdcXHQnKSB7XG4gICAgICAgIGJhc2VJbmRlbnQgPSAnXFx0JztcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRzLmluZGVudCA9PT0gJ251bWJlcicgJiYgb3B0cy5pbmRlbnQgPiAwKSB7XG4gICAgICAgIGJhc2VJbmRlbnQgPSAkam9pbi5jYWxsKEFycmF5KG9wdHMuaW5kZW50ICsgMSksICcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGJhc2U6IGJhc2VJbmRlbnQsXG4gICAgICAgIHByZXY6ICRqb2luLmNhbGwoQXJyYXkoZGVwdGggKyAxKSwgYmFzZUluZGVudClcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkge1xuICAgIGlmICh4cy5sZW5ndGggPT09IDApIHsgcmV0dXJuICcnOyB9XG4gICAgdmFyIGxpbmVKb2luZXIgPSAnXFxuJyArIGluZGVudC5wcmV2ICsgaW5kZW50LmJhc2U7XG4gICAgcmV0dXJuIGxpbmVKb2luZXIgKyAkam9pbi5jYWxsKHhzLCAnLCcgKyBsaW5lSm9pbmVyKSArICdcXG4nICsgaW5kZW50LnByZXY7XG59XG5cbmZ1bmN0aW9uIGFyck9iaktleXMob2JqLCBpbnNwZWN0KSB7XG4gICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmopO1xuICAgIHZhciB4cyA9IFtdO1xuICAgIGlmIChpc0Fycikge1xuICAgICAgICB4cy5sZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgeHNbaV0gPSBoYXMob2JqLCBpKSA/IGluc3BlY3Qob2JqW2ldLCBvYmopIDogJyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHN5bXMgPSB0eXBlb2YgZ09QUyA9PT0gJ2Z1bmN0aW9uJyA/IGdPUFMob2JqKSA6IFtdO1xuICAgIHZhciBzeW1NYXA7XG4gICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzKSB7XG4gICAgICAgIHN5bU1hcCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHN5bXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHN5bU1hcFsnJCcgKyBzeW1zW2tdXSA9IHN5bXNba107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgICAgaWYgKCFoYXMob2JqLCBrZXkpKSB7IGNvbnRpbnVlOyB9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXgsIG5vLWNvbnRpbnVlXG4gICAgICAgIGlmIChpc0FyciAmJiBTdHJpbmcoTnVtYmVyKGtleSkpID09PSBrZXkgJiYga2V5IDwgb2JqLmxlbmd0aCkgeyBjb250aW51ZTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4LCBuby1jb250aW51ZVxuICAgICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMgJiYgc3ltTWFwWyckJyArIGtleV0gaW5zdGFuY2VvZiBTeW1ib2wpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgdG8gcHJldmVudCBzaGFtbWVkIFN5bWJvbHMsIHdoaWNoIGFyZSBzdG9yZWQgYXMgc3RyaW5ncywgZnJvbSBiZWluZyBpbmNsdWRlZCBpbiB0aGUgc3RyaW5nIGtleSBzZWN0aW9uXG4gICAgICAgICAgICBjb250aW51ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheCwgbm8tY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmICgkdGVzdC5jYWxsKC9bXlxcdyRdLywga2V5KSkge1xuICAgICAgICAgICAgeHMucHVzaChpbnNwZWN0KGtleSwgb2JqKSArICc6ICcgKyBpbnNwZWN0KG9ialtrZXldLCBvYmopKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHhzLnB1c2goa2V5ICsgJzogJyArIGluc3BlY3Qob2JqW2tleV0sIG9iaikpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZ09QUyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN5bXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChpc0VudW1lcmFibGUuY2FsbChvYmosIHN5bXNbal0pKSB7XG4gICAgICAgICAgICAgICAgeHMucHVzaCgnWycgKyBpbnNwZWN0KHN5bXNbal0pICsgJ106ICcgKyBpbnNwZWN0KG9ialtzeW1zW2pdXSwgb2JqKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHhzO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG52YXIgcGVyY2VudFR3ZW50aWVzID0gLyUyMC9nO1xuXG52YXIgRm9ybWF0ID0ge1xuICAgIFJGQzE3Mzg6ICdSRkMxNzM4JyxcbiAgICBSRkMzOTg2OiAnUkZDMzk4Nidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgICdkZWZhdWx0JzogRm9ybWF0LlJGQzM5ODYsXG4gICAgZm9ybWF0dGVyczoge1xuICAgICAgICBSRkMxNzM4OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlLmNhbGwodmFsdWUsIHBlcmNlbnRUd2VudGllcywgJysnKTtcbiAgICAgICAgfSxcbiAgICAgICAgUkZDMzk4NjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgUkZDMTczODogRm9ybWF0LlJGQzE3MzgsXG4gICAgUkZDMzk4NjogRm9ybWF0LlJGQzM5ODZcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuL3N0cmluZ2lmeScpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpO1xudmFyIGZvcm1hdHMgPSByZXF1aXJlKCcuL2Zvcm1hdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZm9ybWF0czogZm9ybWF0cyxcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBhbGxvd0RvdHM6IGZhbHNlLFxuICAgIGFsbG93UHJvdG90eXBlczogZmFsc2UsXG4gICAgYWxsb3dTcGFyc2U6IGZhbHNlLFxuICAgIGFycmF5TGltaXQ6IDIwLFxuICAgIGNoYXJzZXQ6ICd1dGYtOCcsXG4gICAgY2hhcnNldFNlbnRpbmVsOiBmYWxzZSxcbiAgICBjb21tYTogZmFsc2UsXG4gICAgZGVjb2RlcjogdXRpbHMuZGVjb2RlLFxuICAgIGRlbGltaXRlcjogJyYnLFxuICAgIGRlcHRoOiA1LFxuICAgIGlnbm9yZVF1ZXJ5UHJlZml4OiBmYWxzZSxcbiAgICBpbnRlcnByZXROdW1lcmljRW50aXRpZXM6IGZhbHNlLFxuICAgIHBhcmFtZXRlckxpbWl0OiAxMDAwLFxuICAgIHBhcnNlQXJyYXlzOiB0cnVlLFxuICAgIHBsYWluT2JqZWN0czogZmFsc2UsXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nOiBmYWxzZVxufTtcblxudmFyIGludGVycHJldE51bWVyaWNFbnRpdGllcyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYjKFxcZCspOy9nLCBmdW5jdGlvbiAoJDAsIG51bWJlclN0cikge1xuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChudW1iZXJTdHIsIDEwKSk7XG4gICAgfSk7XG59O1xuXG52YXIgcGFyc2VBcnJheVZhbHVlID0gZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgb3B0aW9ucy5jb21tYSAmJiB2YWwuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG59O1xuXG4vLyBUaGlzIGlzIHdoYXQgYnJvd3NlcnMgd2lsbCBzdWJtaXQgd2hlbiB0aGUg4pyTIGNoYXJhY3RlciBvY2N1cnMgaW4gYW5cbi8vIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCBib2R5IGFuZCB0aGUgZW5jb2Rpbmcgb2YgdGhlIHBhZ2UgY29udGFpbmluZ1xuLy8gdGhlIGZvcm0gaXMgaXNvLTg4NTktMSwgb3Igd2hlbiB0aGUgc3VibWl0dGVkIGZvcm0gaGFzIGFuIGFjY2VwdC1jaGFyc2V0XG4vLyBhdHRyaWJ1dGUgb2YgaXNvLTg4NTktMS4gUHJlc3VtYWJseSBhbHNvIHdpdGggb3RoZXIgY2hhcnNldHMgdGhhdCBkbyBub3QgY29udGFpblxuLy8gdGhlIOKckyBjaGFyYWN0ZXIsIHN1Y2ggYXMgdXMtYXNjaWkuXG52YXIgaXNvU2VudGluZWwgPSAndXRmOD0lMjYlMjMxMDAwMyUzQic7IC8vIGVuY29kZVVSSUNvbXBvbmVudCgnJiMxMDAwMzsnKVxuXG4vLyBUaGVzZSBhcmUgdGhlIHBlcmNlbnQtZW5jb2RlZCB1dGYtOCBvY3RldHMgcmVwcmVzZW50aW5nIGEgY2hlY2ttYXJrLCBpbmRpY2F0aW5nIHRoYXQgdGhlIHJlcXVlc3QgYWN0dWFsbHkgaXMgdXRmLTggZW5jb2RlZC5cbnZhciBjaGFyc2V0U2VudGluZWwgPSAndXRmOD0lRTIlOUMlOTMnOyAvLyBlbmNvZGVVUklDb21wb25lbnQoJ+KckycpXG5cbnZhciBwYXJzZVZhbHVlcyA9IGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmdWYWx1ZXMoc3RyLCBvcHRpb25zKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIHZhciBjbGVhblN0ciA9IG9wdGlvbnMuaWdub3JlUXVlcnlQcmVmaXggPyBzdHIucmVwbGFjZSgvXlxcPy8sICcnKSA6IHN0cjtcbiAgICB2YXIgbGltaXQgPSBvcHRpb25zLnBhcmFtZXRlckxpbWl0ID09PSBJbmZpbml0eSA/IHVuZGVmaW5lZCA6IG9wdGlvbnMucGFyYW1ldGVyTGltaXQ7XG4gICAgdmFyIHBhcnRzID0gY2xlYW5TdHIuc3BsaXQob3B0aW9ucy5kZWxpbWl0ZXIsIGxpbWl0KTtcbiAgICB2YXIgc2tpcEluZGV4ID0gLTE7IC8vIEtlZXAgdHJhY2sgb2Ygd2hlcmUgdGhlIHV0Zjggc2VudGluZWwgd2FzIGZvdW5kXG4gICAgdmFyIGk7XG5cbiAgICB2YXIgY2hhcnNldCA9IG9wdGlvbnMuY2hhcnNldDtcbiAgICBpZiAob3B0aW9ucy5jaGFyc2V0U2VudGluZWwpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAocGFydHNbaV0uaW5kZXhPZigndXRmOD0nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1tpXSA9PT0gY2hhcnNldFNlbnRpbmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJzZXQgPSAndXRmLTgnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNbaV0gPT09IGlzb1NlbnRpbmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJzZXQgPSAnaXNvLTg4NTktMSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNraXBJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgaSA9IHBhcnRzLmxlbmd0aDsgLy8gVGhlIGVzbGludCBzZXR0aW5ncyBkbyBub3QgYWxsb3cgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGkgPT09IHNraXBJbmRleCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnQgPSBwYXJ0c1tpXTtcblxuICAgICAgICB2YXIgYnJhY2tldEVxdWFsc1BvcyA9IHBhcnQuaW5kZXhPZignXT0nKTtcbiAgICAgICAgdmFyIHBvcyA9IGJyYWNrZXRFcXVhbHNQb3MgPT09IC0xID8gcGFydC5pbmRleE9mKCc9JykgOiBicmFja2V0RXF1YWxzUG9zICsgMTtcblxuICAgICAgICB2YXIga2V5LCB2YWw7XG4gICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICBrZXkgPSBvcHRpb25zLmRlY29kZXIocGFydCwgZGVmYXVsdHMuZGVjb2RlciwgY2hhcnNldCwgJ2tleScpO1xuICAgICAgICAgICAgdmFsID0gb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPyBudWxsIDogJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBvcHRpb25zLmRlY29kZXIocGFydC5zbGljZSgwLCBwb3MpLCBkZWZhdWx0cy5kZWNvZGVyLCBjaGFyc2V0LCAna2V5Jyk7XG4gICAgICAgICAgICB2YWwgPSB1dGlscy5tYXliZU1hcChcbiAgICAgICAgICAgICAgICBwYXJzZUFycmF5VmFsdWUocGFydC5zbGljZShwb3MgKyAxKSwgb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVuY29kZWRWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGVjb2RlcihlbmNvZGVkVmFsLCBkZWZhdWx0cy5kZWNvZGVyLCBjaGFyc2V0LCAndmFsdWUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbCAmJiBvcHRpb25zLmludGVycHJldE51bWVyaWNFbnRpdGllcyAmJiBjaGFyc2V0ID09PSAnaXNvLTg4NTktMScpIHtcbiAgICAgICAgICAgIHZhbCA9IGludGVycHJldE51bWVyaWNFbnRpdGllcyh2YWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcnQuaW5kZXhPZignW109JykgPiAtMSkge1xuICAgICAgICAgICAgdmFsID0gaXNBcnJheSh2YWwpID8gW3ZhbF0gOiB2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IHV0aWxzLmNvbWJpbmUob2JqW2tleV0sIHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG52YXIgcGFyc2VPYmplY3QgPSBmdW5jdGlvbiAoY2hhaW4sIHZhbCwgb3B0aW9ucywgdmFsdWVzUGFyc2VkKSB7XG4gICAgdmFyIGxlYWYgPSB2YWx1ZXNQYXJzZWQgPyB2YWwgOiBwYXJzZUFycmF5VmFsdWUodmFsLCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIGkgPSBjaGFpbi5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgb2JqO1xuICAgICAgICB2YXIgcm9vdCA9IGNoYWluW2ldO1xuXG4gICAgICAgIGlmIChyb290ID09PSAnW10nICYmIG9wdGlvbnMucGFyc2VBcnJheXMpIHtcbiAgICAgICAgICAgIG9iaiA9IFtdLmNvbmNhdChsZWFmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iaiA9IG9wdGlvbnMucGxhaW5PYmplY3RzID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9O1xuICAgICAgICAgICAgdmFyIGNsZWFuUm9vdCA9IHJvb3QuY2hhckF0KDApID09PSAnWycgJiYgcm9vdC5jaGFyQXQocm9vdC5sZW5ndGggLSAxKSA9PT0gJ10nID8gcm9vdC5zbGljZSgxLCAtMSkgOiByb290O1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gcGFyc2VJbnQoY2xlYW5Sb290LCAxMCk7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMucGFyc2VBcnJheXMgJiYgY2xlYW5Sb290ID09PSAnJykge1xuICAgICAgICAgICAgICAgIG9iaiA9IHsgMDogbGVhZiB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAhaXNOYU4oaW5kZXgpXG4gICAgICAgICAgICAgICAgJiYgcm9vdCAhPT0gY2xlYW5Sb290XG4gICAgICAgICAgICAgICAgJiYgU3RyaW5nKGluZGV4KSA9PT0gY2xlYW5Sb290XG4gICAgICAgICAgICAgICAgJiYgaW5kZXggPj0gMFxuICAgICAgICAgICAgICAgICYmIChvcHRpb25zLnBhcnNlQXJyYXlzICYmIGluZGV4IDw9IG9wdGlvbnMuYXJyYXlMaW1pdClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIG9iaiA9IFtdO1xuICAgICAgICAgICAgICAgIG9ialtpbmRleF0gPSBsZWFmO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGVhblJvb3QgIT09ICdfX3Byb3RvX18nKSB7XG4gICAgICAgICAgICAgICAgb2JqW2NsZWFuUm9vdF0gPSBsZWFmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGVhZiA9IG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gbGVhZjtcbn07XG5cbnZhciBwYXJzZUtleXMgPSBmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nS2V5cyhnaXZlbktleSwgdmFsLCBvcHRpb25zLCB2YWx1ZXNQYXJzZWQpIHtcbiAgICBpZiAoIWdpdmVuS2V5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUcmFuc2Zvcm0gZG90IG5vdGF0aW9uIHRvIGJyYWNrZXQgbm90YXRpb25cbiAgICB2YXIga2V5ID0gb3B0aW9ucy5hbGxvd0RvdHMgPyBnaXZlbktleS5yZXBsYWNlKC9cXC4oW14uW10rKS9nLCAnWyQxXScpIDogZ2l2ZW5LZXk7XG5cbiAgICAvLyBUaGUgcmVnZXggY2h1bmtzXG5cbiAgICB2YXIgYnJhY2tldHMgPSAvKFxcW1teW1xcXV0qXSkvO1xuICAgIHZhciBjaGlsZCA9IC8oXFxbW15bXFxdXSpdKS9nO1xuXG4gICAgLy8gR2V0IHRoZSBwYXJlbnRcblxuICAgIHZhciBzZWdtZW50ID0gb3B0aW9ucy5kZXB0aCA+IDAgJiYgYnJhY2tldHMuZXhlYyhrZXkpO1xuICAgIHZhciBwYXJlbnQgPSBzZWdtZW50ID8ga2V5LnNsaWNlKDAsIHNlZ21lbnQuaW5kZXgpIDoga2V5O1xuXG4gICAgLy8gU3Rhc2ggdGhlIHBhcmVudCBpZiBpdCBleGlzdHNcblxuICAgIHZhciBrZXlzID0gW107XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICAvLyBJZiB3ZSBhcmVuJ3QgdXNpbmcgcGxhaW4gb2JqZWN0cywgb3B0aW9uYWxseSBwcmVmaXgga2V5cyB0aGF0IHdvdWxkIG92ZXJ3cml0ZSBvYmplY3QgcHJvdG90eXBlIHByb3BlcnRpZXNcbiAgICAgICAgaWYgKCFvcHRpb25zLnBsYWluT2JqZWN0cyAmJiBoYXMuY2FsbChPYmplY3QucHJvdG90eXBlLCBwYXJlbnQpKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuYWxsb3dQcm90b3R5cGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAga2V5cy5wdXNoKHBhcmVudCk7XG4gICAgfVxuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNoaWxkcmVuIGFwcGVuZGluZyB0byB0aGUgYXJyYXkgdW50aWwgd2UgaGl0IGRlcHRoXG5cbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKG9wdGlvbnMuZGVwdGggPiAwICYmIChzZWdtZW50ID0gY2hpbGQuZXhlYyhrZXkpKSAhPT0gbnVsbCAmJiBpIDwgb3B0aW9ucy5kZXB0aCkge1xuICAgICAgICBpICs9IDE7XG4gICAgICAgIGlmICghb3B0aW9ucy5wbGFpbk9iamVjdHMgJiYgaGFzLmNhbGwoT2JqZWN0LnByb3RvdHlwZSwgc2VnbWVudFsxXS5zbGljZSgxLCAtMSkpKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuYWxsb3dQcm90b3R5cGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGtleXMucHVzaChzZWdtZW50WzFdKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSdzIGEgcmVtYWluZGVyLCBqdXN0IGFkZCB3aGF0ZXZlciBpcyBsZWZ0XG5cbiAgICBpZiAoc2VnbWVudCkge1xuICAgICAgICBrZXlzLnB1c2goJ1snICsga2V5LnNsaWNlKHNlZ21lbnQuaW5kZXgpICsgJ10nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VPYmplY3Qoa2V5cywgdmFsLCBvcHRpb25zLCB2YWx1ZXNQYXJzZWQpO1xufTtcblxudmFyIG5vcm1hbGl6ZVBhcnNlT3B0aW9ucyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZVBhcnNlT3B0aW9ucyhvcHRzKSB7XG4gICAgaWYgKCFvcHRzKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0cztcbiAgICB9XG5cbiAgICBpZiAob3B0cy5kZWNvZGVyICE9PSBudWxsICYmIG9wdHMuZGVjb2RlciAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvcHRzLmRlY29kZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRGVjb2RlciBoYXMgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdHMuY2hhcnNldCAhPT0gJ3VuZGVmaW5lZCcgJiYgb3B0cy5jaGFyc2V0ICE9PSAndXRmLTgnICYmIG9wdHMuY2hhcnNldCAhPT0gJ2lzby04ODU5LTEnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBjaGFyc2V0IG9wdGlvbiBtdXN0IGJlIGVpdGhlciB1dGYtOCwgaXNvLTg4NTktMSwgb3IgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIHZhciBjaGFyc2V0ID0gdHlwZW9mIG9wdHMuY2hhcnNldCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0cy5jaGFyc2V0IDogb3B0cy5jaGFyc2V0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsb3dEb3RzOiB0eXBlb2Ygb3B0cy5hbGxvd0RvdHMgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdHMuYWxsb3dEb3RzIDogISFvcHRzLmFsbG93RG90cyxcbiAgICAgICAgYWxsb3dQcm90b3R5cGVzOiB0eXBlb2Ygb3B0cy5hbGxvd1Byb3RvdHlwZXMgPT09ICdib29sZWFuJyA/IG9wdHMuYWxsb3dQcm90b3R5cGVzIDogZGVmYXVsdHMuYWxsb3dQcm90b3R5cGVzLFxuICAgICAgICBhbGxvd1NwYXJzZTogdHlwZW9mIG9wdHMuYWxsb3dTcGFyc2UgPT09ICdib29sZWFuJyA/IG9wdHMuYWxsb3dTcGFyc2UgOiBkZWZhdWx0cy5hbGxvd1NwYXJzZSxcbiAgICAgICAgYXJyYXlMaW1pdDogdHlwZW9mIG9wdHMuYXJyYXlMaW1pdCA9PT0gJ251bWJlcicgPyBvcHRzLmFycmF5TGltaXQgOiBkZWZhdWx0cy5hcnJheUxpbWl0LFxuICAgICAgICBjaGFyc2V0OiBjaGFyc2V0LFxuICAgICAgICBjaGFyc2V0U2VudGluZWw6IHR5cGVvZiBvcHRzLmNoYXJzZXRTZW50aW5lbCA9PT0gJ2Jvb2xlYW4nID8gb3B0cy5jaGFyc2V0U2VudGluZWwgOiBkZWZhdWx0cy5jaGFyc2V0U2VudGluZWwsXG4gICAgICAgIGNvbW1hOiB0eXBlb2Ygb3B0cy5jb21tYSA9PT0gJ2Jvb2xlYW4nID8gb3B0cy5jb21tYSA6IGRlZmF1bHRzLmNvbW1hLFxuICAgICAgICBkZWNvZGVyOiB0eXBlb2Ygb3B0cy5kZWNvZGVyID09PSAnZnVuY3Rpb24nID8gb3B0cy5kZWNvZGVyIDogZGVmYXVsdHMuZGVjb2RlcixcbiAgICAgICAgZGVsaW1pdGVyOiB0eXBlb2Ygb3B0cy5kZWxpbWl0ZXIgPT09ICdzdHJpbmcnIHx8IHV0aWxzLmlzUmVnRXhwKG9wdHMuZGVsaW1pdGVyKSA/IG9wdHMuZGVsaW1pdGVyIDogZGVmYXVsdHMuZGVsaW1pdGVyLFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW1wbGljaXQtY29lcmNpb24sIG5vLWV4dHJhLXBhcmVuc1xuICAgICAgICBkZXB0aDogKHR5cGVvZiBvcHRzLmRlcHRoID09PSAnbnVtYmVyJyB8fCBvcHRzLmRlcHRoID09PSBmYWxzZSkgPyArb3B0cy5kZXB0aCA6IGRlZmF1bHRzLmRlcHRoLFxuICAgICAgICBpZ25vcmVRdWVyeVByZWZpeDogb3B0cy5pZ25vcmVRdWVyeVByZWZpeCA9PT0gdHJ1ZSxcbiAgICAgICAgaW50ZXJwcmV0TnVtZXJpY0VudGl0aWVzOiB0eXBlb2Ygb3B0cy5pbnRlcnByZXROdW1lcmljRW50aXRpZXMgPT09ICdib29sZWFuJyA/IG9wdHMuaW50ZXJwcmV0TnVtZXJpY0VudGl0aWVzIDogZGVmYXVsdHMuaW50ZXJwcmV0TnVtZXJpY0VudGl0aWVzLFxuICAgICAgICBwYXJhbWV0ZXJMaW1pdDogdHlwZW9mIG9wdHMucGFyYW1ldGVyTGltaXQgPT09ICdudW1iZXInID8gb3B0cy5wYXJhbWV0ZXJMaW1pdCA6IGRlZmF1bHRzLnBhcmFtZXRlckxpbWl0LFxuICAgICAgICBwYXJzZUFycmF5czogb3B0cy5wYXJzZUFycmF5cyAhPT0gZmFsc2UsXG4gICAgICAgIHBsYWluT2JqZWN0czogdHlwZW9mIG9wdHMucGxhaW5PYmplY3RzID09PSAnYm9vbGVhbicgPyBvcHRzLnBsYWluT2JqZWN0cyA6IGRlZmF1bHRzLnBsYWluT2JqZWN0cyxcbiAgICAgICAgc3RyaWN0TnVsbEhhbmRsaW5nOiB0eXBlb2Ygb3B0cy5zdHJpY3ROdWxsSGFuZGxpbmcgPT09ICdib29sZWFuJyA/IG9wdHMuc3RyaWN0TnVsbEhhbmRsaW5nIDogZGVmYXVsdHMuc3RyaWN0TnVsbEhhbmRsaW5nXG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0ciwgb3B0cykge1xuICAgIHZhciBvcHRpb25zID0gbm9ybWFsaXplUGFyc2VPcHRpb25zKG9wdHMpO1xuXG4gICAgaWYgKHN0ciA9PT0gJycgfHwgc3RyID09PSBudWxsIHx8IHR5cGVvZiBzdHIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLnBsYWluT2JqZWN0cyA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcE9iaiA9IHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gcGFyc2VWYWx1ZXMoc3RyLCBvcHRpb25zKSA6IHN0cjtcbiAgICB2YXIgb2JqID0gb3B0aW9ucy5wbGFpbk9iamVjdHMgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge307XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgYW5kIHNldHVwIHRoZSBuZXcgb2JqZWN0XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRlbXBPYmopO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIG5ld09iaiA9IHBhcnNlS2V5cyhrZXksIHRlbXBPYmpba2V5XSwgb3B0aW9ucywgdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpO1xuICAgICAgICBvYmogPSB1dGlscy5tZXJnZShvYmosIG5ld09iaiwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuYWxsb3dTcGFyc2UgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICByZXR1cm4gdXRpbHMuY29tcGFjdChvYmopO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdldFNpZGVDaGFubmVsID0gcmVxdWlyZSgnc2lkZS1jaGFubmVsJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgZm9ybWF0cyA9IHJlcXVpcmUoJy4vZm9ybWF0cycpO1xudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBhcnJheVByZWZpeEdlbmVyYXRvcnMgPSB7XG4gICAgYnJhY2tldHM6IGZ1bmN0aW9uIGJyYWNrZXRzKHByZWZpeCkge1xuICAgICAgICByZXR1cm4gcHJlZml4ICsgJ1tdJztcbiAgICB9LFxuICAgIGNvbW1hOiAnY29tbWEnLFxuICAgIGluZGljZXM6IGZ1bmN0aW9uIGluZGljZXMocHJlZml4LCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeCArICdbJyArIGtleSArICddJztcbiAgICB9LFxuICAgIHJlcGVhdDogZnVuY3Rpb24gcmVwZWF0KHByZWZpeCkge1xuICAgICAgICByZXR1cm4gcHJlZml4O1xuICAgIH1cbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbnZhciBzcGxpdCA9IFN0cmluZy5wcm90b3R5cGUuc3BsaXQ7XG52YXIgcHVzaCA9IEFycmF5LnByb3RvdHlwZS5wdXNoO1xudmFyIHB1c2hUb0FycmF5ID0gZnVuY3Rpb24gKGFyciwgdmFsdWVPckFycmF5KSB7XG4gICAgcHVzaC5hcHBseShhcnIsIGlzQXJyYXkodmFsdWVPckFycmF5KSA/IHZhbHVlT3JBcnJheSA6IFt2YWx1ZU9yQXJyYXldKTtcbn07XG5cbnZhciB0b0lTTyA9IERhdGUucHJvdG90eXBlLnRvSVNPU3RyaW5nO1xuXG52YXIgZGVmYXVsdEZvcm1hdCA9IGZvcm1hdHNbJ2RlZmF1bHQnXTtcbnZhciBkZWZhdWx0cyA9IHtcbiAgICBhZGRRdWVyeVByZWZpeDogZmFsc2UsXG4gICAgYWxsb3dEb3RzOiBmYWxzZSxcbiAgICBjaGFyc2V0OiAndXRmLTgnLFxuICAgIGNoYXJzZXRTZW50aW5lbDogZmFsc2UsXG4gICAgZGVsaW1pdGVyOiAnJicsXG4gICAgZW5jb2RlOiB0cnVlLFxuICAgIGVuY29kZXI6IHV0aWxzLmVuY29kZSxcbiAgICBlbmNvZGVWYWx1ZXNPbmx5OiBmYWxzZSxcbiAgICBmb3JtYXQ6IGRlZmF1bHRGb3JtYXQsXG4gICAgZm9ybWF0dGVyOiBmb3JtYXRzLmZvcm1hdHRlcnNbZGVmYXVsdEZvcm1hdF0sXG4gICAgLy8gZGVwcmVjYXRlZFxuICAgIGluZGljZXM6IGZhbHNlLFxuICAgIHNlcmlhbGl6ZURhdGU6IGZ1bmN0aW9uIHNlcmlhbGl6ZURhdGUoZGF0ZSkge1xuICAgICAgICByZXR1cm4gdG9JU08uY2FsbChkYXRlKTtcbiAgICB9LFxuICAgIHNraXBOdWxsczogZmFsc2UsXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nOiBmYWxzZVxufTtcblxudmFyIGlzTm9uTnVsbGlzaFByaW1pdGl2ZSA9IGZ1bmN0aW9uIGlzTm9uTnVsbGlzaFByaW1pdGl2ZSh2KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcidcbiAgICAgICAgfHwgdHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICB8fCB0eXBlb2YgdiA9PT0gJ3N5bWJvbCdcbiAgICAgICAgfHwgdHlwZW9mIHYgPT09ICdiaWdpbnQnO1xufTtcblxudmFyIHNlbnRpbmVsID0ge307XG5cbnZhciBzdHJpbmdpZnkgPSBmdW5jdGlvbiBzdHJpbmdpZnkoXG4gICAgb2JqZWN0LFxuICAgIHByZWZpeCxcbiAgICBnZW5lcmF0ZUFycmF5UHJlZml4LFxuICAgIHN0cmljdE51bGxIYW5kbGluZyxcbiAgICBza2lwTnVsbHMsXG4gICAgZW5jb2RlcixcbiAgICBmaWx0ZXIsXG4gICAgc29ydCxcbiAgICBhbGxvd0RvdHMsXG4gICAgc2VyaWFsaXplRGF0ZSxcbiAgICBmb3JtYXQsXG4gICAgZm9ybWF0dGVyLFxuICAgIGVuY29kZVZhbHVlc09ubHksXG4gICAgY2hhcnNldCxcbiAgICBzaWRlQ2hhbm5lbFxuKSB7XG4gICAgdmFyIG9iaiA9IG9iamVjdDtcblxuICAgIHZhciB0bXBTYyA9IHNpZGVDaGFubmVsO1xuICAgIHZhciBzdGVwID0gMDtcbiAgICB2YXIgZmluZEZsYWcgPSBmYWxzZTtcbiAgICB3aGlsZSAoKHRtcFNjID0gdG1wU2MuZ2V0KHNlbnRpbmVsKSkgIT09IHZvaWQgdW5kZWZpbmVkICYmICFmaW5kRmxhZykge1xuICAgICAgICAvLyBXaGVyZSBvYmplY3QgbGFzdCBhcHBlYXJlZCBpbiB0aGUgcmVmIHRyZWVcbiAgICAgICAgdmFyIHBvcyA9IHRtcFNjLmdldChvYmplY3QpO1xuICAgICAgICBzdGVwICs9IDE7XG4gICAgICAgIGlmICh0eXBlb2YgcG9zICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKHBvcyA9PT0gc3RlcCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdDeWNsaWMgb2JqZWN0IHZhbHVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpbmRGbGFnID0gdHJ1ZTsgLy8gQnJlYWsgd2hpbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRtcFNjLmdldChzZW50aW5lbCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzdGVwID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9iaiA9IGZpbHRlcihwcmVmaXgsIG9iaik7XG4gICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIG9iaiA9IHNlcmlhbGl6ZURhdGUob2JqKTtcbiAgICB9IGVsc2UgaWYgKGdlbmVyYXRlQXJyYXlQcmVmaXggPT09ICdjb21tYScgJiYgaXNBcnJheShvYmopKSB7XG4gICAgICAgIG9iaiA9IHV0aWxzLm1heWJlTWFwKG9iaiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZURhdGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgICAgIGlmIChzdHJpY3ROdWxsSGFuZGxpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmNvZGVyICYmICFlbmNvZGVWYWx1ZXNPbmx5ID8gZW5jb2RlcihwcmVmaXgsIGRlZmF1bHRzLmVuY29kZXIsIGNoYXJzZXQsICdrZXknLCBmb3JtYXQpIDogcHJlZml4O1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqID0gJyc7XG4gICAgfVxuXG4gICAgaWYgKGlzTm9uTnVsbGlzaFByaW1pdGl2ZShvYmopIHx8IHV0aWxzLmlzQnVmZmVyKG9iaikpIHtcbiAgICAgICAgaWYgKGVuY29kZXIpIHtcbiAgICAgICAgICAgIHZhciBrZXlWYWx1ZSA9IGVuY29kZVZhbHVlc09ubHkgPyBwcmVmaXggOiBlbmNvZGVyKHByZWZpeCwgZGVmYXVsdHMuZW5jb2RlciwgY2hhcnNldCwgJ2tleScsIGZvcm1hdCk7XG4gICAgICAgICAgICBpZiAoZ2VuZXJhdGVBcnJheVByZWZpeCA9PT0gJ2NvbW1hJyAmJiBlbmNvZGVWYWx1ZXNPbmx5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlc0FycmF5ID0gc3BsaXQuY2FsbChTdHJpbmcob2JqKSwgJywnKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzSm9pbmVkID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXNBcnJheS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNKb2luZWQgKz0gKGkgPT09IDAgPyAnJyA6ICcsJykgKyBmb3JtYXR0ZXIoZW5jb2Rlcih2YWx1ZXNBcnJheVtpXSwgZGVmYXVsdHMuZW5jb2RlciwgY2hhcnNldCwgJ3ZhbHVlJywgZm9ybWF0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbZm9ybWF0dGVyKGtleVZhbHVlKSArIChpc0FycmF5KG9iaikgJiYgdmFsdWVzQXJyYXkubGVuZ3RoID09PSAxID8gJ1tdJyA6ICcnKSArICc9JyArIHZhbHVlc0pvaW5lZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW2Zvcm1hdHRlcihrZXlWYWx1ZSkgKyAnPScgKyBmb3JtYXR0ZXIoZW5jb2RlcihvYmosIGRlZmF1bHRzLmVuY29kZXIsIGNoYXJzZXQsICd2YWx1ZScsIGZvcm1hdCkpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2Zvcm1hdHRlcihwcmVmaXgpICsgJz0nICsgZm9ybWF0dGVyKFN0cmluZyhvYmopKV07XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxuXG4gICAgdmFyIG9iaktleXM7XG4gICAgaWYgKGdlbmVyYXRlQXJyYXlQcmVmaXggPT09ICdjb21tYScgJiYgaXNBcnJheShvYmopKSB7XG4gICAgICAgIC8vIHdlIG5lZWQgdG8gam9pbiBlbGVtZW50cyBpblxuICAgICAgICBvYmpLZXlzID0gW3sgdmFsdWU6IG9iai5sZW5ndGggPiAwID8gb2JqLmpvaW4oJywnKSB8fCBudWxsIDogdm9pZCB1bmRlZmluZWQgfV07XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGZpbHRlcikpIHtcbiAgICAgICAgb2JqS2V5cyA9IGZpbHRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAgICAgIG9iaktleXMgPSBzb3J0ID8ga2V5cy5zb3J0KHNvcnQpIDoga2V5cztcbiAgICB9XG5cbiAgICB2YXIgYWRqdXN0ZWRQcmVmaXggPSBnZW5lcmF0ZUFycmF5UHJlZml4ID09PSAnY29tbWEnICYmIGlzQXJyYXkob2JqKSAmJiBvYmoubGVuZ3RoID09PSAxID8gcHJlZml4ICsgJ1tdJyA6IHByZWZpeDtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqS2V5cy5sZW5ndGg7ICsraikge1xuICAgICAgICB2YXIga2V5ID0gb2JqS2V5c1tqXTtcbiAgICAgICAgdmFyIHZhbHVlID0gdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGtleS52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkudmFsdWUgOiBvYmpba2V5XTtcblxuICAgICAgICBpZiAoc2tpcE51bGxzICYmIHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXlQcmVmaXggPSBpc0FycmF5KG9iailcbiAgICAgICAgICAgID8gdHlwZW9mIGdlbmVyYXRlQXJyYXlQcmVmaXggPT09ICdmdW5jdGlvbicgPyBnZW5lcmF0ZUFycmF5UHJlZml4KGFkanVzdGVkUHJlZml4LCBrZXkpIDogYWRqdXN0ZWRQcmVmaXhcbiAgICAgICAgICAgIDogYWRqdXN0ZWRQcmVmaXggKyAoYWxsb3dEb3RzID8gJy4nICsga2V5IDogJ1snICsga2V5ICsgJ10nKTtcblxuICAgICAgICBzaWRlQ2hhbm5lbC5zZXQob2JqZWN0LCBzdGVwKTtcbiAgICAgICAgdmFyIHZhbHVlU2lkZUNoYW5uZWwgPSBnZXRTaWRlQ2hhbm5lbCgpO1xuICAgICAgICB2YWx1ZVNpZGVDaGFubmVsLnNldChzZW50aW5lbCwgc2lkZUNoYW5uZWwpO1xuICAgICAgICBwdXNoVG9BcnJheSh2YWx1ZXMsIHN0cmluZ2lmeShcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAga2V5UHJlZml4LFxuICAgICAgICAgICAgZ2VuZXJhdGVBcnJheVByZWZpeCxcbiAgICAgICAgICAgIHN0cmljdE51bGxIYW5kbGluZyxcbiAgICAgICAgICAgIHNraXBOdWxscyxcbiAgICAgICAgICAgIGVuY29kZXIsXG4gICAgICAgICAgICBmaWx0ZXIsXG4gICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgYWxsb3dEb3RzLFxuICAgICAgICAgICAgc2VyaWFsaXplRGF0ZSxcbiAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgIGZvcm1hdHRlcixcbiAgICAgICAgICAgIGVuY29kZVZhbHVlc09ubHksXG4gICAgICAgICAgICBjaGFyc2V0LFxuICAgICAgICAgICAgdmFsdWVTaWRlQ2hhbm5lbFxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVzO1xufTtcblxudmFyIG5vcm1hbGl6ZVN0cmluZ2lmeU9wdGlvbnMgPSBmdW5jdGlvbiBub3JtYWxpemVTdHJpbmdpZnlPcHRpb25zKG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmVuY29kZXIgIT09IG51bGwgJiYgdHlwZW9mIG9wdHMuZW5jb2RlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG9wdHMuZW5jb2RlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFbmNvZGVyIGhhcyB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBjaGFyc2V0ID0gb3B0cy5jaGFyc2V0IHx8IGRlZmF1bHRzLmNoYXJzZXQ7XG4gICAgaWYgKHR5cGVvZiBvcHRzLmNoYXJzZXQgIT09ICd1bmRlZmluZWQnICYmIG9wdHMuY2hhcnNldCAhPT0gJ3V0Zi04JyAmJiBvcHRzLmNoYXJzZXQgIT09ICdpc28tODg1OS0xJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgY2hhcnNldCBvcHRpb24gbXVzdCBiZSBlaXRoZXIgdXRmLTgsIGlzby04ODU5LTEsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIHZhciBmb3JtYXQgPSBmb3JtYXRzWydkZWZhdWx0J107XG4gICAgaWYgKHR5cGVvZiBvcHRzLmZvcm1hdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKCFoYXMuY2FsbChmb3JtYXRzLmZvcm1hdHRlcnMsIG9wdHMuZm9ybWF0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBmb3JtYXQgb3B0aW9uIHByb3ZpZGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGZvcm1hdCA9IG9wdHMuZm9ybWF0O1xuICAgIH1cbiAgICB2YXIgZm9ybWF0dGVyID0gZm9ybWF0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG5cbiAgICB2YXIgZmlsdGVyID0gZGVmYXVsdHMuZmlsdGVyO1xuICAgIGlmICh0eXBlb2Ygb3B0cy5maWx0ZXIgPT09ICdmdW5jdGlvbicgfHwgaXNBcnJheShvcHRzLmZpbHRlcikpIHtcbiAgICAgICAgZmlsdGVyID0gb3B0cy5maWx0ZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWRkUXVlcnlQcmVmaXg6IHR5cGVvZiBvcHRzLmFkZFF1ZXJ5UHJlZml4ID09PSAnYm9vbGVhbicgPyBvcHRzLmFkZFF1ZXJ5UHJlZml4IDogZGVmYXVsdHMuYWRkUXVlcnlQcmVmaXgsXG4gICAgICAgIGFsbG93RG90czogdHlwZW9mIG9wdHMuYWxsb3dEb3RzID09PSAndW5kZWZpbmVkJyA/IGRlZmF1bHRzLmFsbG93RG90cyA6ICEhb3B0cy5hbGxvd0RvdHMsXG4gICAgICAgIGNoYXJzZXQ6IGNoYXJzZXQsXG4gICAgICAgIGNoYXJzZXRTZW50aW5lbDogdHlwZW9mIG9wdHMuY2hhcnNldFNlbnRpbmVsID09PSAnYm9vbGVhbicgPyBvcHRzLmNoYXJzZXRTZW50aW5lbCA6IGRlZmF1bHRzLmNoYXJzZXRTZW50aW5lbCxcbiAgICAgICAgZGVsaW1pdGVyOiB0eXBlb2Ygb3B0cy5kZWxpbWl0ZXIgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdHMuZGVsaW1pdGVyIDogb3B0cy5kZWxpbWl0ZXIsXG4gICAgICAgIGVuY29kZTogdHlwZW9mIG9wdHMuZW5jb2RlID09PSAnYm9vbGVhbicgPyBvcHRzLmVuY29kZSA6IGRlZmF1bHRzLmVuY29kZSxcbiAgICAgICAgZW5jb2RlcjogdHlwZW9mIG9wdHMuZW5jb2RlciA9PT0gJ2Z1bmN0aW9uJyA/IG9wdHMuZW5jb2RlciA6IGRlZmF1bHRzLmVuY29kZXIsXG4gICAgICAgIGVuY29kZVZhbHVlc09ubHk6IHR5cGVvZiBvcHRzLmVuY29kZVZhbHVlc09ubHkgPT09ICdib29sZWFuJyA/IG9wdHMuZW5jb2RlVmFsdWVzT25seSA6IGRlZmF1bHRzLmVuY29kZVZhbHVlc09ubHksXG4gICAgICAgIGZpbHRlcjogZmlsdGVyLFxuICAgICAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICAgICAgZm9ybWF0dGVyOiBmb3JtYXR0ZXIsXG4gICAgICAgIHNlcmlhbGl6ZURhdGU6IHR5cGVvZiBvcHRzLnNlcmlhbGl6ZURhdGUgPT09ICdmdW5jdGlvbicgPyBvcHRzLnNlcmlhbGl6ZURhdGUgOiBkZWZhdWx0cy5zZXJpYWxpemVEYXRlLFxuICAgICAgICBza2lwTnVsbHM6IHR5cGVvZiBvcHRzLnNraXBOdWxscyA9PT0gJ2Jvb2xlYW4nID8gb3B0cy5za2lwTnVsbHMgOiBkZWZhdWx0cy5za2lwTnVsbHMsXG4gICAgICAgIHNvcnQ6IHR5cGVvZiBvcHRzLnNvcnQgPT09ICdmdW5jdGlvbicgPyBvcHRzLnNvcnQgOiBudWxsLFxuICAgICAgICBzdHJpY3ROdWxsSGFuZGxpbmc6IHR5cGVvZiBvcHRzLnN0cmljdE51bGxIYW5kbGluZyA9PT0gJ2Jvb2xlYW4nID8gb3B0cy5zdHJpY3ROdWxsSGFuZGxpbmcgOiBkZWZhdWx0cy5zdHJpY3ROdWxsSGFuZGxpbmdcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBvcHRzKSB7XG4gICAgdmFyIG9iaiA9IG9iamVjdDtcbiAgICB2YXIgb3B0aW9ucyA9IG5vcm1hbGl6ZVN0cmluZ2lmeU9wdGlvbnMob3B0cyk7XG5cbiAgICB2YXIgb2JqS2V5cztcbiAgICB2YXIgZmlsdGVyO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmZpbHRlcjtcbiAgICAgICAgb2JqID0gZmlsdGVyKCcnLCBvYmopO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvcHRpb25zLmZpbHRlcikpIHtcbiAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5maWx0ZXI7XG4gICAgICAgIG9iaktleXMgPSBmaWx0ZXI7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBbXTtcblxuICAgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHZhciBhcnJheUZvcm1hdDtcbiAgICBpZiAob3B0cyAmJiBvcHRzLmFycmF5Rm9ybWF0IGluIGFycmF5UHJlZml4R2VuZXJhdG9ycykge1xuICAgICAgICBhcnJheUZvcm1hdCA9IG9wdHMuYXJyYXlGb3JtYXQ7XG4gICAgfSBlbHNlIGlmIChvcHRzICYmICdpbmRpY2VzJyBpbiBvcHRzKSB7XG4gICAgICAgIGFycmF5Rm9ybWF0ID0gb3B0cy5pbmRpY2VzID8gJ2luZGljZXMnIDogJ3JlcGVhdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXJyYXlGb3JtYXQgPSAnaW5kaWNlcyc7XG4gICAgfVxuXG4gICAgdmFyIGdlbmVyYXRlQXJyYXlQcmVmaXggPSBhcnJheVByZWZpeEdlbmVyYXRvcnNbYXJyYXlGb3JtYXRdO1xuXG4gICAgaWYgKCFvYmpLZXlzKSB7XG4gICAgICAgIG9iaktleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnNvcnQpIHtcbiAgICAgICAgb2JqS2V5cy5zb3J0KG9wdGlvbnMuc29ydCk7XG4gICAgfVxuXG4gICAgdmFyIHNpZGVDaGFubmVsID0gZ2V0U2lkZUNoYW5uZWwoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iaktleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IG9iaktleXNbaV07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc2tpcE51bGxzICYmIG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBwdXNoVG9BcnJheShrZXlzLCBzdHJpbmdpZnkoXG4gICAgICAgICAgICBvYmpba2V5XSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIGdlbmVyYXRlQXJyYXlQcmVmaXgsXG4gICAgICAgICAgICBvcHRpb25zLnN0cmljdE51bGxIYW5kbGluZyxcbiAgICAgICAgICAgIG9wdGlvbnMuc2tpcE51bGxzLFxuICAgICAgICAgICAgb3B0aW9ucy5lbmNvZGUgPyBvcHRpb25zLmVuY29kZXIgOiBudWxsLFxuICAgICAgICAgICAgb3B0aW9ucy5maWx0ZXIsXG4gICAgICAgICAgICBvcHRpb25zLnNvcnQsXG4gICAgICAgICAgICBvcHRpb25zLmFsbG93RG90cyxcbiAgICAgICAgICAgIG9wdGlvbnMuc2VyaWFsaXplRGF0ZSxcbiAgICAgICAgICAgIG9wdGlvbnMuZm9ybWF0LFxuICAgICAgICAgICAgb3B0aW9ucy5mb3JtYXR0ZXIsXG4gICAgICAgICAgICBvcHRpb25zLmVuY29kZVZhbHVlc09ubHksXG4gICAgICAgICAgICBvcHRpb25zLmNoYXJzZXQsXG4gICAgICAgICAgICBzaWRlQ2hhbm5lbFxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICB2YXIgam9pbmVkID0ga2V5cy5qb2luKG9wdGlvbnMuZGVsaW1pdGVyKTtcbiAgICB2YXIgcHJlZml4ID0gb3B0aW9ucy5hZGRRdWVyeVByZWZpeCA9PT0gdHJ1ZSA/ICc/JyA6ICcnO1xuXG4gICAgaWYgKG9wdGlvbnMuY2hhcnNldFNlbnRpbmVsKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNoYXJzZXQgPT09ICdpc28tODg1OS0xJykge1xuICAgICAgICAgICAgLy8gZW5jb2RlVVJJQ29tcG9uZW50KCcmIzEwMDAzOycpLCB0aGUgXCJudW1lcmljIGVudGl0eVwiIHJlcHJlc2VudGF0aW9uIG9mIGEgY2hlY2ttYXJrXG4gICAgICAgICAgICBwcmVmaXggKz0gJ3V0Zjg9JTI2JTIzMTAwMDMlM0ImJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGVuY29kZVVSSUNvbXBvbmVudCgn4pyTJylcbiAgICAgICAgICAgIHByZWZpeCArPSAndXRmOD0lRTIlOUMlOTMmJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqb2luZWQubGVuZ3RoID4gMCA/IHByZWZpeCArIGpvaW5lZCA6ICcnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvcm1hdHMgPSByZXF1aXJlKCcuL2Zvcm1hdHMnKTtcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbnZhciBoZXhUYWJsZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgICAgICBhcnJheS5wdXNoKCclJyArICgoaSA8IDE2ID8gJzAnIDogJycpICsgaS50b1N0cmluZygxNikpLnRvVXBwZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheTtcbn0oKSk7XG5cbnZhciBjb21wYWN0UXVldWUgPSBmdW5jdGlvbiBjb21wYWN0UXVldWUocXVldWUpIHtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgaXRlbSA9IHF1ZXVlLnBvcCgpO1xuICAgICAgICB2YXIgb2JqID0gaXRlbS5vYmpbaXRlbS5wcm9wXTtcblxuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YXIgY29tcGFjdGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpbal0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3RlZC5wdXNoKG9ialtqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtLm9ialtpdGVtLnByb3BdID0gY29tcGFjdGVkO1xuICAgICAgICB9XG4gICAgfVxufTtcblxudmFyIGFycmF5VG9PYmplY3QgPSBmdW5jdGlvbiBhcnJheVRvT2JqZWN0KHNvdXJjZSwgb3B0aW9ucykge1xuICAgIHZhciBvYmogPSBvcHRpb25zICYmIG9wdGlvbnMucGxhaW5PYmplY3RzID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgb2JqW2ldID0gc291cmNlW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBtZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKHRhcmdldCwgc291cmNlLCBvcHRpb25zKSB7XG4gICAgLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiAwICovXG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgICAgdGFyZ2V0LnB1c2goc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQgJiYgdHlwZW9mIHRhcmdldCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGlmICgob3B0aW9ucyAmJiAob3B0aW9ucy5wbGFpbk9iamVjdHMgfHwgb3B0aW9ucy5hbGxvd1Byb3RvdHlwZXMpKSB8fCAhaGFzLmNhbGwoT2JqZWN0LnByb3RvdHlwZSwgc291cmNlKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtzb3VyY2VdID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbdGFyZ2V0LCBzb3VyY2VdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gW3RhcmdldF0uY29uY2F0KHNvdXJjZSk7XG4gICAgfVxuXG4gICAgdmFyIG1lcmdlVGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGlmIChpc0FycmF5KHRhcmdldCkgJiYgIWlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICBtZXJnZVRhcmdldCA9IGFycmF5VG9PYmplY3QodGFyZ2V0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheSh0YXJnZXQpICYmIGlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICBzb3VyY2UuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgICAgICAgaWYgKGhhcy5jYWxsKHRhcmdldCwgaSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0SXRlbSA9IHRhcmdldFtpXTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0SXRlbSAmJiB0eXBlb2YgdGFyZ2V0SXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2ldID0gbWVyZ2UodGFyZ2V0SXRlbSwgaXRlbSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbaV0gPSBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc291cmNlKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHNvdXJjZVtrZXldO1xuXG4gICAgICAgIGlmIChoYXMuY2FsbChhY2MsIGtleSkpIHtcbiAgICAgICAgICAgIGFjY1trZXldID0gbWVyZ2UoYWNjW2tleV0sIHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjY1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBtZXJnZVRhcmdldCk7XG59O1xuXG52YXIgYXNzaWduID0gZnVuY3Rpb24gYXNzaWduU2luZ2xlU291cmNlKHRhcmdldCwgc291cmNlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNvdXJjZSkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICBhY2Nba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHRhcmdldCk7XG59O1xuXG52YXIgZGVjb2RlID0gZnVuY3Rpb24gKHN0ciwgZGVjb2RlciwgY2hhcnNldCkge1xuICAgIHZhciBzdHJXaXRob3V0UGx1cyA9IHN0ci5yZXBsYWNlKC9cXCsvZywgJyAnKTtcbiAgICBpZiAoY2hhcnNldCA9PT0gJ2lzby04ODU5LTEnKSB7XG4gICAgICAgIC8vIHVuZXNjYXBlIG5ldmVyIHRocm93cywgbm8gdHJ5Li4uY2F0Y2ggbmVlZGVkOlxuICAgICAgICByZXR1cm4gc3RyV2l0aG91dFBsdXMucmVwbGFjZSgvJVswLTlhLWZdezJ9L2dpLCB1bmVzY2FwZSk7XG4gICAgfVxuICAgIC8vIHV0Zi04XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHJXaXRob3V0UGx1cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gc3RyV2l0aG91dFBsdXM7XG4gICAgfVxufTtcblxudmFyIGVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShzdHIsIGRlZmF1bHRFbmNvZGVyLCBjaGFyc2V0LCBraW5kLCBmb3JtYXQpIHtcbiAgICAvLyBUaGlzIGNvZGUgd2FzIG9yaWdpbmFsbHkgd3JpdHRlbiBieSBCcmlhbiBXaGl0ZSAobXNjZGV4KSBmb3IgdGhlIGlvLmpzIGNvcmUgcXVlcnlzdHJpbmcgbGlicmFyeS5cbiAgICAvLyBJdCBoYXMgYmVlbiBhZGFwdGVkIGhlcmUgZm9yIHN0cmljdGVyIGFkaGVyZW5jZSB0byBSRkMgMzk4NlxuICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuXG4gICAgdmFyIHN0cmluZyA9IHN0cjtcbiAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgc3RyaW5nID0gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN0cik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICBzdHJpbmcgPSBTdHJpbmcoc3RyKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhcnNldCA9PT0gJ2lzby04ODU5LTEnKSB7XG4gICAgICAgIHJldHVybiBlc2NhcGUoc3RyaW5nKS5yZXBsYWNlKC8ldVswLTlhLWZdezR9L2dpLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgICAgICAgIHJldHVybiAnJTI2JTIzJyArIHBhcnNlSW50KCQwLnNsaWNlKDIpLCAxNikgKyAnJTNCJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIG91dCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgYyA9PT0gMHgyRCAvLyAtXG4gICAgICAgICAgICB8fCBjID09PSAweDJFIC8vIC5cbiAgICAgICAgICAgIHx8IGMgPT09IDB4NUYgLy8gX1xuICAgICAgICAgICAgfHwgYyA9PT0gMHg3RSAvLyB+XG4gICAgICAgICAgICB8fCAoYyA+PSAweDMwICYmIGMgPD0gMHgzOSkgLy8gMC05XG4gICAgICAgICAgICB8fCAoYyA+PSAweDQxICYmIGMgPD0gMHg1QSkgLy8gYS16XG4gICAgICAgICAgICB8fCAoYyA+PSAweDYxICYmIGMgPD0gMHg3QSkgLy8gQS1aXG4gICAgICAgICAgICB8fCAoZm9ybWF0ID09PSBmb3JtYXRzLlJGQzE3MzggJiYgKGMgPT09IDB4MjggfHwgYyA9PT0gMHgyOSkpIC8vICggKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG91dCArPSBzdHJpbmcuY2hhckF0KGkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYyA8IDB4ODApIHtcbiAgICAgICAgICAgIG91dCA9IG91dCArIGhleFRhYmxlW2NdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYyA8IDB4ODAwKSB7XG4gICAgICAgICAgICBvdXQgPSBvdXQgKyAoaGV4VGFibGVbMHhDMCB8IChjID4+IDYpXSArIGhleFRhYmxlWzB4ODAgfCAoYyAmIDB4M0YpXSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjIDwgMHhEODAwIHx8IGMgPj0gMHhFMDAwKSB7XG4gICAgICAgICAgICBvdXQgPSBvdXQgKyAoaGV4VGFibGVbMHhFMCB8IChjID4+IDEyKV0gKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDYpICYgMHgzRildICsgaGV4VGFibGVbMHg4MCB8IChjICYgMHgzRildKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaSArPSAxO1xuICAgICAgICBjID0gMHgxMDAwMCArICgoKGMgJiAweDNGRikgPDwgMTApIHwgKHN0cmluZy5jaGFyQ29kZUF0KGkpICYgMHgzRkYpKTtcbiAgICAgICAgLyogZXNsaW50IG9wZXJhdG9yLWxpbmVicmVhazogWzIsIFwiYmVmb3JlXCJdICovXG4gICAgICAgIG91dCArPSBoZXhUYWJsZVsweEYwIHwgKGMgPj4gMTgpXVxuICAgICAgICAgICAgKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDEyKSAmIDB4M0YpXVxuICAgICAgICAgICAgKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDYpICYgMHgzRildXG4gICAgICAgICAgICArIGhleFRhYmxlWzB4ODAgfCAoYyAmIDB4M0YpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxudmFyIGNvbXBhY3QgPSBmdW5jdGlvbiBjb21wYWN0KHZhbHVlKSB7XG4gICAgdmFyIHF1ZXVlID0gW3sgb2JqOiB7IG86IHZhbHVlIH0sIHByb3A6ICdvJyB9XTtcbiAgICB2YXIgcmVmcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgaXRlbSA9IHF1ZXVlW2ldO1xuICAgICAgICB2YXIgb2JqID0gaXRlbS5vYmpbaXRlbS5wcm9wXTtcblxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgdmFyIGtleSA9IGtleXNbal07XG4gICAgICAgICAgICB2YXIgdmFsID0gb2JqW2tleV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsICYmIHJlZnMuaW5kZXhPZih2YWwpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goeyBvYmo6IG9iaiwgcHJvcDoga2V5IH0pO1xuICAgICAgICAgICAgICAgIHJlZnMucHVzaCh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcGFjdFF1ZXVlKHF1ZXVlKTtcblxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbnZhciBpc1JlZ0V4cCA9IGZ1bmN0aW9uIGlzUmVnRXhwKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59O1xuXG52YXIgaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlcihvYmopIHtcbiAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iaikpO1xufTtcblxudmFyIGNvbWJpbmUgPSBmdW5jdGlvbiBjb21iaW5lKGEsIGIpIHtcbiAgICByZXR1cm4gW10uY29uY2F0KGEsIGIpO1xufTtcblxudmFyIG1heWJlTWFwID0gZnVuY3Rpb24gbWF5YmVNYXAodmFsLCBmbikge1xuICAgIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgICAgdmFyIG1hcHBlZCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbWFwcGVkLnB1c2goZm4odmFsW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcHBlZDtcbiAgICB9XG4gICAgcmV0dXJuIGZuKHZhbCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhcnJheVRvT2JqZWN0OiBhcnJheVRvT2JqZWN0LFxuICAgIGFzc2lnbjogYXNzaWduLFxuICAgIGNvbWJpbmU6IGNvbWJpbmUsXG4gICAgY29tcGFjdDogY29tcGFjdCxcbiAgICBkZWNvZGU6IGRlY29kZSxcbiAgICBlbmNvZGU6IGVuY29kZSxcbiAgICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gICAgaXNSZWdFeHA6IGlzUmVnRXhwLFxuICAgIG1heWJlTWFwOiBtYXliZU1hcCxcbiAgICBtZXJnZTogbWVyZ2Vcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoZ2xvYmFsLnNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5leHRIYW5kbGUgPSAxOyAvLyBTcGVjIHNheXMgZ3JlYXRlciB0aGFuIHplcm9cbiAgICB2YXIgdGFza3NCeUhhbmRsZSA9IHt9O1xuICAgIHZhciBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICB2YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xuICAgIHZhciByZWdpc3RlckltbWVkaWF0ZTtcblxuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShjYWxsYmFjaykge1xuICAgICAgLy8gQ2FsbGJhY2sgY2FuIGVpdGhlciBiZSBhIGZ1bmN0aW9uIG9yIGEgc3RyaW5nXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oXCJcIiArIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIC8vIENvcHkgZnVuY3Rpb24gYXJndW1lbnRzXG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIH1cbiAgICAgIC8vIFN0b3JlIGFuZCByZWdpc3RlciB0aGUgdGFza1xuICAgICAgdmFyIHRhc2sgPSB7IGNhbGxiYWNrOiBjYWxsYmFjaywgYXJnczogYXJncyB9O1xuICAgICAgdGFza3NCeUhhbmRsZVtuZXh0SGFuZGxlXSA9IHRhc2s7XG4gICAgICByZWdpc3RlckltbWVkaWF0ZShuZXh0SGFuZGxlKTtcbiAgICAgIHJldHVybiBuZXh0SGFuZGxlKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaGFuZGxlKSB7XG4gICAgICAgIGRlbGV0ZSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuKHRhc2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGFzay5jYWxsYmFjaztcbiAgICAgICAgdmFyIGFyZ3MgPSB0YXNrLmFyZ3M7XG4gICAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuSWZQcmVzZW50KGhhbmRsZSkge1xuICAgICAgICAvLyBGcm9tIHRoZSBzcGVjOiBcIldhaXQgdW50aWwgYW55IGludm9jYXRpb25zIG9mIHRoaXMgYWxnb3JpdGhtIHN0YXJ0ZWQgYmVmb3JlIHRoaXMgb25lIGhhdmUgY29tcGxldGVkLlwiXG4gICAgICAgIC8vIFNvIGlmIHdlJ3JlIGN1cnJlbnRseSBydW5uaW5nIGEgdGFzaywgd2UnbGwgbmVlZCB0byBkZWxheSB0aGlzIGludm9jYXRpb24uXG4gICAgICAgIGlmIChjdXJyZW50bHlSdW5uaW5nQVRhc2spIHtcbiAgICAgICAgICAgIC8vIERlbGF5IGJ5IGRvaW5nIGEgc2V0VGltZW91dC4gc2V0SW1tZWRpYXRlIHdhcyB0cmllZCBpbnN0ZWFkLCBidXQgaW4gRmlyZWZveCA3IGl0IGdlbmVyYXRlZCBhXG4gICAgICAgICAgICAvLyBcInRvbyBtdWNoIHJlY3Vyc2lvblwiIGVycm9yLlxuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBydW4odGFzayk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbW1lZGlhdGUoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHsgcnVuSWZQcmVzZW50KGhhbmRsZSk7IH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblVzZVBvc3RNZXNzYWdlKCkge1xuICAgICAgICAvLyBUaGUgdGVzdCBhZ2FpbnN0IGBpbXBvcnRTY3JpcHRzYCBwcmV2ZW50cyB0aGlzIGltcGxlbWVudGF0aW9uIGZyb20gYmVpbmcgaW5zdGFsbGVkIGluc2lkZSBhIHdlYiB3b3JrZXIsXG4gICAgICAgIC8vIHdoZXJlIGBnbG9iYWwucG9zdE1lc3NhZ2VgIG1lYW5zIHNvbWV0aGluZyBjb21wbGV0ZWx5IGRpZmZlcmVudCBhbmQgY2FuJ3QgYmUgdXNlZCBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgICBpZiAoZ2xvYmFsLnBvc3RNZXNzYWdlICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG9sZE9uTWVzc2FnZSA9IGdsb2JhbC5vbm1lc3NhZ2U7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShcIlwiLCBcIipcIik7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gb2xkT25NZXNzYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgLy8gSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciBvbiBgZ2xvYmFsYCBmb3IgdGhlIGBtZXNzYWdlYCBldmVudDogc2VlXG4gICAgICAgIC8vICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL3dpbmRvdy5wb3N0TWVzc2FnZVxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2NvbW1zLmh0bWwjY3Jvc3NEb2N1bWVudE1lc3NhZ2VzXG5cbiAgICAgICAgdmFyIG1lc3NhZ2VQcmVmaXggPSBcInNldEltbWVkaWF0ZSRcIiArIE1hdGgucmFuZG9tKCkgKyBcIiRcIjtcbiAgICAgICAgdmFyIG9uR2xvYmFsTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXhPZihtZXNzYWdlUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudCgrZXZlbnQuZGF0YS5zbGljZShtZXNzYWdlUHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsLmF0dGFjaEV2ZW50KFwib25tZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKG1lc3NhZ2VQcmVmaXggKyBoYW5kbGUsIFwiKlwiKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZShoYW5kbGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIDxzY3JpcHQ+IGVsZW1lbnQ7IGl0cyByZWFkeXN0YXRlY2hhbmdlIGV2ZW50IHdpbGwgYmUgZmlyZWQgYXN5bmNocm9ub3VzbHkgb25jZSBpdCBpcyBpbnNlcnRlZFxuICAgICAgICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuIERvIHNvLCB0aHVzIHF1ZXVpbmcgdXAgdGhlIHRhc2suIFJlbWVtYmVyIHRvIGNsZWFuIHVwIG9uY2UgaXQncyBiZWVuIGNhbGxlZC5cbiAgICAgICAgICAgIHZhciBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgaHRtbC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHRtbC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bklmUHJlc2VudCwgMCwgaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBzdXBwb3J0ZWQsIHdlIHNob3VsZCBhdHRhY2ggdG8gdGhlIHByb3RvdHlwZSBvZiBnbG9iYWwsIHNpbmNlIHRoYXQgaXMgd2hlcmUgc2V0VGltZW91dCBldCBhbC4gbGl2ZS5cbiAgICB2YXIgYXR0YWNoVG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCk7XG4gICAgYXR0YWNoVG8gPSBhdHRhY2hUbyAmJiBhdHRhY2hUby5zZXRUaW1lb3V0ID8gYXR0YWNoVG8gOiBnbG9iYWw7XG5cbiAgICAvLyBEb24ndCBnZXQgZm9vbGVkIGJ5IGUuZy4gYnJvd3NlcmlmeSBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoZ2xvYmFsLnByb2Nlc3MpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIikge1xuICAgICAgICAvLyBGb3IgTm9kZS5qcyBiZWZvcmUgMC45XG4gICAgICAgIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGNhblVzZVBvc3RNZXNzYWdlKCkpIHtcbiAgICAgICAgLy8gRm9yIG5vbi1JRTEwIG1vZGVybiBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuTWVzc2FnZUNoYW5uZWwpIHtcbiAgICAgICAgLy8gRm9yIHdlYiB3b3JrZXJzLCB3aGVyZSBzdXBwb3J0ZWRcbiAgICAgICAgaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZG9jICYmIFwib25yZWFkeXN0YXRlY2hhbmdlXCIgaW4gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgLy8gRm9yIElFIDbigJM4XG4gICAgICAgIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoVG8uc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuICAgIGF0dGFjaFRvLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG59KHR5cGVvZiBzZWxmID09PSBcInVuZGVmaW5lZFwiID8gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHRoaXMgOiBnbG9iYWwgOiBzZWxmKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG52YXIgY2FsbEJvdW5kID0gcmVxdWlyZSgnY2FsbC1iaW5kL2NhbGxCb3VuZCcpO1xudmFyIGluc3BlY3QgPSByZXF1aXJlKCdvYmplY3QtaW5zcGVjdCcpO1xuXG52YXIgJFR5cGVFcnJvciA9IEdldEludHJpbnNpYygnJVR5cGVFcnJvciUnKTtcbnZhciAkV2Vha01hcCA9IEdldEludHJpbnNpYygnJVdlYWtNYXAlJywgdHJ1ZSk7XG52YXIgJE1hcCA9IEdldEludHJpbnNpYygnJU1hcCUnLCB0cnVlKTtcblxudmFyICR3ZWFrTWFwR2V0ID0gY2FsbEJvdW5kKCdXZWFrTWFwLnByb3RvdHlwZS5nZXQnLCB0cnVlKTtcbnZhciAkd2Vha01hcFNldCA9IGNhbGxCb3VuZCgnV2Vha01hcC5wcm90b3R5cGUuc2V0JywgdHJ1ZSk7XG52YXIgJHdlYWtNYXBIYXMgPSBjYWxsQm91bmQoJ1dlYWtNYXAucHJvdG90eXBlLmhhcycsIHRydWUpO1xudmFyICRtYXBHZXQgPSBjYWxsQm91bmQoJ01hcC5wcm90b3R5cGUuZ2V0JywgdHJ1ZSk7XG52YXIgJG1hcFNldCA9IGNhbGxCb3VuZCgnTWFwLnByb3RvdHlwZS5zZXQnLCB0cnVlKTtcbnZhciAkbWFwSGFzID0gY2FsbEJvdW5kKCdNYXAucHJvdG90eXBlLmhhcycsIHRydWUpO1xuXG4vKlxuICogVGhpcyBmdW5jdGlvbiB0cmF2ZXJzZXMgdGhlIGxpc3QgcmV0dXJuaW5nIHRoZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhlXG4gKiBnaXZlbiBrZXkuXG4gKlxuICogVGhhdCBub2RlIGlzIGFsc28gbW92ZWQgdG8gdGhlIGhlYWQgb2YgdGhlIGxpc3QsIHNvIHRoYXQgaWYgaXQncyBhY2Nlc3NlZFxuICogYWdhaW4gd2UgZG9uJ3QgbmVlZCB0byB0cmF2ZXJzZSB0aGUgd2hvbGUgbGlzdC4gQnkgZG9pbmcgc28sIGFsbCB0aGUgcmVjZW50bHlcbiAqIHVzZWQgbm9kZXMgY2FuIGJlIGFjY2Vzc2VkIHJlbGF0aXZlbHkgcXVpY2tseS5cbiAqL1xudmFyIGxpc3RHZXROb2RlID0gZnVuY3Rpb24gKGxpc3QsIGtleSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG5cdGZvciAodmFyIHByZXYgPSBsaXN0LCBjdXJyOyAoY3VyciA9IHByZXYubmV4dCkgIT09IG51bGw7IHByZXYgPSBjdXJyKSB7XG5cdFx0aWYgKGN1cnIua2V5ID09PSBrZXkpIHtcblx0XHRcdHByZXYubmV4dCA9IGN1cnIubmV4dDtcblx0XHRcdGN1cnIubmV4dCA9IGxpc3QubmV4dDtcblx0XHRcdGxpc3QubmV4dCA9IGN1cnI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cblx0XHRcdHJldHVybiBjdXJyO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGxpc3RHZXQgPSBmdW5jdGlvbiAob2JqZWN0cywga2V5KSB7XG5cdHZhciBub2RlID0gbGlzdEdldE5vZGUob2JqZWN0cywga2V5KTtcblx0cmV0dXJuIG5vZGUgJiYgbm9kZS52YWx1ZTtcbn07XG52YXIgbGlzdFNldCA9IGZ1bmN0aW9uIChvYmplY3RzLCBrZXksIHZhbHVlKSB7XG5cdHZhciBub2RlID0gbGlzdEdldE5vZGUob2JqZWN0cywga2V5KTtcblx0aWYgKG5vZGUpIHtcblx0XHRub2RlLnZhbHVlID0gdmFsdWU7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gUHJlcGVuZCB0aGUgbmV3IG5vZGUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdFxuXHRcdG9iamVjdHMubmV4dCA9IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuXHRcdFx0a2V5OiBrZXksXG5cdFx0XHRuZXh0OiBvYmplY3RzLm5leHQsXG5cdFx0XHR2YWx1ZTogdmFsdWVcblx0XHR9O1xuXHR9XG59O1xudmFyIGxpc3RIYXMgPSBmdW5jdGlvbiAob2JqZWN0cywga2V5KSB7XG5cdHJldHVybiAhIWxpc3RHZXROb2RlKG9iamVjdHMsIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFNpZGVDaGFubmVsKCkge1xuXHR2YXIgJHdtO1xuXHR2YXIgJG07XG5cdHZhciAkbztcblx0dmFyIGNoYW5uZWwgPSB7XG5cdFx0YXNzZXJ0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRpZiAoIWNoYW5uZWwuaGFzKGtleSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ1NpZGUgY2hhbm5lbCBkb2VzIG5vdCBjb250YWluICcgKyBpbnNwZWN0KGtleSkpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC1yZXR1cm5cblx0XHRcdGlmICgkV2Vha01hcCAmJiBrZXkgJiYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBrZXkgPT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdGlmICgkd20pIHtcblx0XHRcdFx0XHRyZXR1cm4gJHdlYWtNYXBHZXQoJHdtLCBrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCRNYXApIHtcblx0XHRcdFx0aWYgKCRtKSB7XG5cdFx0XHRcdFx0cmV0dXJuICRtYXBHZXQoJG0sIGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICgkbykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmVseS1pZlxuXHRcdFx0XHRcdHJldHVybiBsaXN0R2V0KCRvLCBrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRoYXM6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdGlmICgkV2Vha01hcCAmJiBrZXkgJiYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBrZXkgPT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdGlmICgkd20pIHtcblx0XHRcdFx0XHRyZXR1cm4gJHdlYWtNYXBIYXMoJHdtLCBrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCRNYXApIHtcblx0XHRcdFx0aWYgKCRtKSB7XG5cdFx0XHRcdFx0cmV0dXJuICRtYXBIYXMoJG0sIGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICgkbykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmVseS1pZlxuXHRcdFx0XHRcdHJldHVybiBsaXN0SGFzKCRvLCBrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0XHRpZiAoJFdlYWtNYXAgJiYga2V5ICYmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyB8fCB0eXBlb2Yga2V5ID09PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHRpZiAoISR3bSkge1xuXHRcdFx0XHRcdCR3bSA9IG5ldyAkV2Vha01hcCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCR3ZWFrTWFwU2V0KCR3bSwga2V5LCB2YWx1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKCRNYXApIHtcblx0XHRcdFx0aWYgKCEkbSkge1xuXHRcdFx0XHRcdCRtID0gbmV3ICRNYXAoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkbWFwU2V0KCRtLCBrZXksIHZhbHVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghJG8pIHtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdCAqIEluaXRpYWxpemUgdGhlIGxpbmtlZCBsaXN0IGFzIGFuIGVtcHR5IG5vZGUsIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZVxuXHRcdFx0XHRcdCAqIHRvIHNwZWNpYWwtY2FzZSBoYW5kbGluZyBvZiB0aGUgZmlyc3Qgbm9kZTogd2UgY2FuIGFsd2F5cyByZWZlciB0b1xuXHRcdFx0XHRcdCAqIGl0IGFzIChwcmV2aW91cyBub2RlKS5uZXh0LCBpbnN0ZWFkIG9mIHNvbWV0aGluZyBsaWtlIChsaXN0KS5oZWFkXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0JG8gPSB7IGtleToge30sIG5leHQ6IG51bGwgfTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0U2V0KCRvLCBrZXksIHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBjaGFubmVsO1xufTtcbiIsImZ1bmN0aW9uIEFnZW50KCkge1xuICB0aGlzLl9kZWZhdWx0cyA9IFtdO1xufVxuXG5mb3IgKGNvbnN0IGZuIG9mIFtcbiAgJ3VzZScsXG4gICdvbicsXG4gICdvbmNlJyxcbiAgJ3NldCcsXG4gICdxdWVyeScsXG4gICd0eXBlJyxcbiAgJ2FjY2VwdCcsXG4gICdhdXRoJyxcbiAgJ3dpdGhDcmVkZW50aWFscycsXG4gICdzb3J0UXVlcnknLFxuICAncmV0cnknLFxuICAnb2snLFxuICAncmVkaXJlY3RzJyxcbiAgJ3RpbWVvdXQnLFxuICAnYnVmZmVyJyxcbiAgJ3NlcmlhbGl6ZScsXG4gICdwYXJzZScsXG4gICdjYScsXG4gICdrZXknLFxuICAncGZ4JyxcbiAgJ2NlcnQnLFxuICAnZGlzYWJsZVRMU0NlcnRzJ1xuXSkge1xuICAvLyBEZWZhdWx0IHNldHRpbmcgZm9yIGFsbCByZXF1ZXN0cyBmcm9tIHRoaXMgYWdlbnRcbiAgQWdlbnQucHJvdG90eXBlW2ZuXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgdGhpcy5fZGVmYXVsdHMucHVzaCh7IGZuLCBhcmdzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuX3NldERlZmF1bHRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgZm9yIChjb25zdCBkZWYgb2YgdGhpcy5fZGVmYXVsdHMpIHtcbiAgICByZXF1ZXN0W2RlZi5mbl0oLi4uZGVmLmFyZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnZW50O1xuIiwiLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG5sZXQgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gT3RoZXIgZW52aXJvbm1lbnRzXG4gIGNvbnNvbGUud2FybihcbiAgICAnVXNpbmcgYnJvd3Nlci1vbmx5IHZlcnNpb24gb2Ygc3VwZXJhZ2VudCBpbiBub24tYnJvd3NlciBlbnZpcm9ubWVudCdcbiAgKTtcbiAgcm9vdCA9IHRoaXM7XG59IGVsc2Uge1xuICAvLyBXZWIgV29ya2VyXG4gIHJvb3QgPSBzZWxmO1xufVxuXG5jb25zdCBFbWl0dGVyID0gcmVxdWlyZSgnY29tcG9uZW50LWVtaXR0ZXInKTtcbmNvbnN0IHNhZmVTdHJpbmdpZnkgPSByZXF1aXJlKCdmYXN0LXNhZmUtc3RyaW5naWZ5Jyk7XG5jb25zdCBxcyA9IHJlcXVpcmUoJ3FzJyk7XG5jb25zdCBSZXF1ZXN0QmFzZSA9IHJlcXVpcmUoJy4vcmVxdWVzdC1iYXNlJyk7XG5jb25zdCB7IGlzT2JqZWN0LCBtaXhpbiwgaGFzT3duIH0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5jb25zdCBSZXNwb25zZUJhc2UgPSByZXF1aXJlKCcuL3Jlc3BvbnNlLWJhc2UnKTtcbmNvbnN0IEFnZW50ID0gcmVxdWlyZSgnLi9hZ2VudC1iYXNlJyk7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICh0eXBlb2YgdXJsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn07XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcblxuY29uc3QgcmVxdWVzdCA9IGV4cG9ydHM7XG5cbmV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5yZXF1ZXN0LmdldFhIUiA9ICgpID0+IHtcbiAgaWYgKFxuICAgIHJvb3QuWE1MSHR0cFJlcXVlc3QgJiZcbiAgICAoIXJvb3QubG9jYXRpb24gfHwgcm9vdC5sb2NhdGlvbi5wcm90b2NvbCAhPT0gJ2ZpbGU6JylcbiAgKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGNvdWxkIG5vdCBmaW5kIFhIUicpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmNvbnN0IHRyaW0gPSAnJy50cmltID8gKHMpID0+IHMudHJpbSgpIDogKHMpID0+IHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkgcmV0dXJuIG9iamVjdDtcbiAgY29uc3QgcGFpcnMgPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKGhhc093bihvYmplY3QsIGtleSkpIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIG9iamVjdFtrZXldKTtcbiAgfVxuXG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUkkoa2V5KSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCB2IG9mIHZhbHVlKSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCBzdWJrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmIChoYXNPd24odmFsdWUsIHN1YmtleSkpXG4gICAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBgJHtrZXl9WyR7c3Via2V5fV1gLCB2YWx1ZVtzdWJrZXldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUkkoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbnJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyaW5nXykge1xuICBjb25zdCBvYmplY3QgPSB7fTtcbiAgY29uc3QgcGFpcnMgPSBzdHJpbmdfLnNwbGl0KCcmJyk7XG4gIGxldCBwYWlyO1xuICBsZXQgcG9zO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGhfID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuZ3RoXzsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBvcyA9IHBhaXIuaW5kZXhPZignPScpO1xuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICBvYmplY3RbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIpXSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3RbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIuc2xpY2UoMCwgcG9zKSldID0gZGVjb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBwYWlyLnNsaWNlKHBvcyArIDEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICd0ZXh0L3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICBmb3JtOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBxcy5zdHJpbmdpZnksXG4gICdhcHBsaWNhdGlvbi9qc29uJzogc2FmZVN0cmluZ2lmeVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlcnMuXG4gKlxuICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAqICAgICB9O1xuICpcbiAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cmluZ18pIHtcbiAgY29uc3QgbGluZXMgPSBzdHJpbmdfLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGZpZWxkcyA9IHt9O1xuICBsZXQgaW5kZXg7XG4gIGxldCBsaW5lO1xuICBsZXQgZmllbGQ7XG4gIGxldCB2YWx1ZTtcblxuICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoXyA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbmd0aF87ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIC8vIGNvdWxkIGJlIGVtcHR5IGxpbmUsIGp1c3Qgc2tpcCBpdFxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbHVlID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIC8vIHNob3VsZCBtYXRjaCAvanNvbiBvciAranNvblxuICAvLyBidXQgbm90IC9qc29uLXNlcVxuICByZXR1cm4gL1svK11qc29uKCR8W14tXFx3XSkvaS50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXF1ZXN0Xykge1xuICB0aGlzLnJlcSA9IHJlcXVlc3RfO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPVxuICAgICh0aGlzLnJlcS5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgICAgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fFxuICAgIHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgbGV0IHsgc3RhdHVzIH0gPSB0aGlzLnhocjtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xuICB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG5cbiAgaWYgKHRoaXMudGV4dCA9PT0gbnVsbCAmJiByZXF1ZXN0Xy5fcmVzcG9uc2VUeXBlKSB7XG4gICAgdGhpcy5ib2R5ID0gdGhpcy54aHIucmVzcG9uc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5ib2R5ID1cbiAgICAgIHRoaXMucmVxLm1ldGhvZCA9PT0gJ0hFQUQnXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHRoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSk7XG4gIH1cbn1cblxubWl4aW4oUmVzcG9uc2UucHJvdG90eXBlLCBSZXNwb25zZUJhc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5fcGFyc2VCb2R5ID0gZnVuY3Rpb24gKHN0cmluZ18pIHtcbiAgbGV0IHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICBpZiAodGhpcy5yZXEuX3BhcnNlcikge1xuICAgIHJldHVybiB0aGlzLnJlcS5fcGFyc2VyKHRoaXMsIHN0cmluZ18pO1xuICB9XG5cbiAgaWYgKCFwYXJzZSAmJiBpc0pTT04odGhpcy50eXBlKSkge1xuICAgIHBhcnNlID0gcmVxdWVzdC5wYXJzZVsnYXBwbGljYXRpb24vanNvbiddO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlICYmIHN0cmluZ18gJiYgKHN0cmluZ18ubGVuZ3RoID4gMCB8fCBzdHJpbmdfIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyaW5nXylcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB7IHJlcSB9ID0gdGhpcztcbiAgY29uc3QgeyBtZXRob2QgfSA9IHJlcTtcbiAgY29uc3QgeyB1cmwgfSA9IHJlcTtcblxuICBjb25zdCBtZXNzYWdlID0gYGNhbm5vdCAke21ldGhvZH0gJHt1cmx9ICgke3RoaXMuc3RhdHVzfSlgO1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgZXJyb3Iuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVycm9yLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyb3IudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTsgLy8gcHJlc2VydmVzIGhlYWRlciBuYW1lIGNhc2VcbiAgdGhpcy5faGVhZGVyID0ge307IC8vIGNvZXJjZXMgaGVhZGVyIG5hbWVzIHRvIGxvd2VyY2FzZVxuICB0aGlzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBsZXQgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVycm9yLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVycm9yLm9yaWdpbmFsID0gZXJyO1xuICAgICAgLy8gaXNzdWUgIzY3NTogcmV0dXJuIHRoZSByYXcgcmVzcG9uc2UgaWYgdGhlIHJlc3BvbnNlIHBhcnNpbmcgZmFpbHNcbiAgICAgIGlmIChzZWxmLnhocikge1xuICAgICAgICAvLyBpZTkgZG9lc24ndCBoYXZlICdyZXNwb25zZScgcHJvcGVydHlcbiAgICAgICAgZXJyb3IucmF3UmVzcG9uc2UgPVxuICAgICAgICAgIHR5cGVvZiBzZWxmLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICA/IHNlbGYueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICAgICAgOiBzZWxmLnhoci5yZXNwb25zZTtcbiAgICAgICAgLy8gaXNzdWUgIzg3NjogcmV0dXJuIHRoZSBodHRwIHN0YXR1cyBjb2RlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHNlbGYueGhyLnN0YXR1cyA/IHNlbGYueGhyLnN0YXR1cyA6IG51bGw7XG4gICAgICAgIGVycm9yLnN0YXR1c0NvZGUgPSBlcnJvci5zdGF0dXM7IC8vIGJhY2t3YXJkcy1jb21wYXQgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IucmF3UmVzcG9uc2UgPSBudWxsO1xuICAgICAgICBlcnJvci5zdGF0dXMgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnJvcik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBsZXQgbmV3X2Vycm9yO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXNlbGYuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIG5ld19lcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICByZXMuc3RhdHVzVGV4dCB8fCByZXMudGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuZXdfZXJyb3IgPSBlcnI7IC8vIG9rKCkgY2FsbGJhY2sgY2FuIHRocm93XG4gICAgfVxuXG4gICAgLy8gIzEwMDAgZG9uJ3QgY2F0Y2ggZXJyb3JzIGZyb20gdGhlIGNhbGxiYWNrIHRvIGF2b2lkIGRvdWJsZSBjYWxsaW5nIGl0XG4gICAgaWYgKG5ld19lcnJvcikge1xuICAgICAgbmV3X2Vycm9yLm9yaWdpbmFsID0gZXJyb3I7XG4gICAgICBuZXdfZXJyb3IucmVzcG9uc2UgPSByZXM7XG4gICAgICBuZXdfZXJyb3Iuc3RhdHVzID0gbmV3X2Vycm9yLnN0YXR1cyB8fCByZXMuc3RhdHVzO1xuICAgICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyb3IsIHJlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYCBhbmQgYFJlcXVlc3RCYXNlYC5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbm1peGluKFJlcXVlc3QucHJvdG90eXBlLCBSZXF1ZXN0QmFzZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Bhc3NdIG9wdGlvbmFsIGluIGNhc2Ugb2YgdXNpbmcgJ2JlYXJlcicgYXMgdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nLCAnYmFzaWMnIG9yICdiZWFyZXInIChkZWZhdWx0ICdiYXNpYycpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdHlwZTogdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicgPyAnYmFzaWMnIDogJ2F1dG8nXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGVuY29kZXIgPSBvcHRpb25zLmVuY29kZXJcbiAgICA/IG9wdGlvbnMuZW5jb2RlclxuICAgIDogKHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYnRvYShzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGJhc2ljIGF1dGgsIGJ0b2EgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgIH07XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB2YWx1ZSA9IHNlcmlhbGl6ZSh2YWx1ZSk7XG4gIGlmICh2YWx1ZSkgdGhpcy5fcXVlcnkucHVzaCh2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2NvbnRlbnQnLCBuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiAoZmllbGQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgaWYgKGZpbGUpIHtcbiAgICBpZiAodGhpcy5fZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3VwZXJhZ2VudCBjYW4ndCBtaXggLnNlbmQoKSBhbmQgLmF0dGFjaCgpXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBvcHRpb25zIHx8IGZpbGUubmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyb3IsIHJlcykge1xuICBpZiAodGhpcy5fc2hvdWxkUmV0cnkoZXJyb3IsIHJlcykpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV0cnkoKTtcbiAgfVxuXG4gIGNvbnN0IGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVycm9yLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgZm4oZXJyb3IsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJ1xuICApO1xuICBlcnJvci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyb3Iuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVycm9yLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICBlcnJvci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbn07XG5cbi8vIFRoaXMgb25seSB3YXJucywgYmVjYXVzZSB0aGUgcmVxdWVzdCBpcyBzdGlsbCBsaWtlbHkgdG8gd29ya1xuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUud2FybignVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudDtcblJlcXVlc3QucHJvdG90eXBlLmJ1ZmZlciA9IFJlcXVlc3QucHJvdG90eXBlLmNhO1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnU3RyZWFtaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnXG4gICk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGU7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIC8vIE5hdGl2ZSBvYmplY3RzIHN0cmluZ2lmeSB0byBbb2JqZWN0IEZpbGVdLCBbb2JqZWN0IEJsb2JdLCBbb2JqZWN0IEZvcm1EYXRhXSwgZXRjLlxuICByZXR1cm4gKFxuICAgIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgIUFycmF5LmlzQXJyYXkob2JqZWN0KSAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpICE9PSAnW29iamVjdCBPYmplY3RdJ1xuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2FybmluZzogLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBxdWVyeXN0cmluZ1xuICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG5cbiAgdGhpcy5fZW5kKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fc2V0VXBsb2FkVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gdXBsb2FkIHRpbWVvdXQgaXQncyB3b2tycyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gIGlmICh0aGlzLl91cGxvYWRUaW1lb3V0ICYmICF0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1VwbG9hZCB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3VwbG9hZFRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3VwbG9hZFRpbWVvdXQpO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUuX2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soXG4gICAgICBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgZXZlbiBiZWZvcmUgLmVuZCgpIHdhcyBjYWxsZWQnKVxuICAgICk7XG5cbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgY29uc3QgeyB4aHIgfSA9IHRoaXM7XG4gIGxldCBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICB0aGlzLl9zZXRUaW1lb3V0cygpO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsICgpID0+IHtcbiAgICBjb25zdCB7IHJlYWR5U3RhdGUgfSA9IHhocjtcbiAgICBpZiAocmVhZHlTdGF0ZSA+PSAyICYmIHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICAgIH1cblxuICAgIGlmIChyZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIGxldCBzdGF0dXM7XG4gICAgdHJ5IHtcbiAgICAgIHN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgfSBjYXRjaCB7XG4gICAgICBzdGF0dXMgPSAwO1xuICAgIH1cblxuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCB8fCBzZWxmLl9hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfSk7XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgY29uc3QgaGFuZGxlUHJvZ3Jlc3MgPSAoZGlyZWN0aW9uLCBlKSA9PiB7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcblxuICAgICAgaWYgKGUucGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcblxuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB0cnkge1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAnZG93bmxvYWQnKSk7XG4gICAgICBpZiAoeGhyLnVwbG9hZCkge1xuICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgJ3Byb2dyZXNzJyxcbiAgICAgICAgICBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICd1cGxvYWQnKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgICB9XG4gIH1cblxuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHRoaXMuX3NldFVwbG9hZFRpbWVvdXQoKTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgdHJ5IHtcbiAgICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUsIHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gc2VlICMxMTQ5XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoXG4gICAgIXRoaXMuX2Zvcm1EYXRhICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdHRVQnICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgIHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJlxuICAgICF0aGlzLl9pc0hvc3QoZGF0YSlcbiAgKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGxldCBzZXJpYWxpemUgPVxuICAgICAgdGhpcy5fc2VyaWFsaXplciB8fFxuICAgICAgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgfVxuXG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAoY29uc3QgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAodGhpcy5oZWFkZXJbZmllbGRdID09PSBudWxsKSBjb250aW51ZTtcblxuICAgIGlmIChoYXNPd24odGhpcy5oZWFkZXIsIGZpZWxkKSlcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIC8vIElFMTEgeGhyLnNlbmQodW5kZWZpbmVkKSBzZW5kcyAndW5kZWZpbmVkJyBzdHJpbmcgYXMgUE9TVCBwYXlsb2FkIChpbnN0ZWFkIG9mIG5vdGhpbmcpXG4gIC8vIFdlIG5lZWQgbnVsbCBoZXJlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gIHhoci5zZW5kKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhKTtcbn07XG5cbnJlcXVlc3QuYWdlbnQgPSAoKSA9PiBuZXcgQWdlbnQoKTtcblxuZm9yIChjb25zdCBtZXRob2Qgb2YgWydHRVQnLCAnUE9TVCcsICdPUFRJT05TJywgJ1BBVENIJywgJ1BVVCcsICdERUxFVEUnXSkge1xuICBBZ2VudC5wcm90b3R5cGVbbWV0aG9kLnRvTG93ZXJDYXNlKCldID0gZnVuY3Rpb24gKHVybCwgZm4pIHtcbiAgICBjb25zdCByZXF1ZXN0XyA9IG5ldyByZXF1ZXN0LlJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIHRoaXMuX3NldERlZmF1bHRzKHJlcXVlc3RfKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJlcXVlc3RfLmVuZChmbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVlc3RfO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuZGVsID0gQWdlbnQucHJvdG90eXBlLmRlbGV0ZTtcblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIE9QVElPTlMgcXVlcnkgdG8gYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0Lm9wdGlvbnMgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ09QVElPTlMnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVsKHVybCwgZGF0YSwgZm4pIHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59XG5cbnJlcXVlc3QuZGVsID0gZGVsO1xucmVxdWVzdC5kZWxldGUgPSBkZWw7XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG4iLCJjb25zdCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuLyoqXG4gKiBNb2R1bGUgb2YgbWl4ZWQtaW4gZnVuY3Rpb25zIHNoYXJlZCBiZXR3ZWVuIG5vZGUgYW5kIGNsaWVudCBjb2RlXG4gKi9cbmNvbnN0IHsgaXNPYmplY3QsIGhhc093biB9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdEJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdEJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdEJhc2UoKSB7fVxuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIGNsZWFyVGltZW91dCh0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcik7XG4gIGNsZWFyVGltZW91dCh0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICBkZWxldGUgdGhpcy5fdGltZXI7XG4gIGRlbGV0ZSB0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcjtcbiAgZGVsZXRlIHRoaXMuX3VwbG9hZFRpbWVvdXRUaW1lcjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlIGRlZmF1bHQgcmVzcG9uc2UgYm9keSBwYXJzZXJcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHRvIGNvbnZlcnQgaW5jb21pbmcgZGF0YSBpbnRvIHJlcXVlc3QuYm9keVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIChmbikge1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBmb3JtYXQgb2YgYmluYXJ5IHJlc3BvbnNlIGJvZHkuXG4gKiBJbiBicm93c2VyIHZhbGlkIGZvcm1hdHMgYXJlICdibG9iJyBhbmQgJ2FycmF5YnVmZmVyJyxcbiAqIHdoaWNoIHJldHVybiBCbG9iIGFuZCBBcnJheUJ1ZmZlciwgcmVzcGVjdGl2ZWx5LlxuICpcbiAqIEluIE5vZGUgYWxsIHZhbHVlcyByZXN1bHQgaW4gQnVmZmVyLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnJlc3BvbnNlVHlwZSgnYmxvYicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZXNwb25zZVR5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy5fcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IHJlcXVlc3QgYm9keSBzZXJpYWxpemVyXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byBjb252ZXJ0IGRhdGEgc2V0IHZpYSAuc2VuZCBvciAuYXR0YWNoIGludG8gcGF5bG9hZCB0byBzZW5kXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChmbikge1xuICB0aGlzLl9zZXJpYWxpemVyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGltZW91dHMuXG4gKlxuICogLSByZXNwb25zZSB0aW1lb3V0IGlzIHRpbWUgYmV0d2VlbiBzZW5kaW5nIHJlcXVlc3QgYW5kIHJlY2VpdmluZyB0aGUgZmlyc3QgYnl0ZSBvZiB0aGUgcmVzcG9uc2UuIEluY2x1ZGVzIEROUyBhbmQgY29ubmVjdGlvbiB0aW1lLlxuICogLSBkZWFkbGluZSBpcyB0aGUgdGltZSBmcm9tIHN0YXJ0IG9mIHRoZSByZXF1ZXN0IHRvIHJlY2VpdmluZyByZXNwb25zZSBib2R5IGluIGZ1bGwuIElmIHRoZSBkZWFkbGluZSBpcyB0b28gc2hvcnQgbGFyZ2UgZmlsZXMgbWF5IG5vdCBsb2FkIGF0IGFsbCBvbiBzbG93IGNvbm5lY3Rpb25zLlxuICogLSB1cGxvYWQgaXMgdGhlIHRpbWUgIHNpbmNlIGxhc3QgYml0IG9mIGRhdGEgd2FzIHNlbnQgb3IgcmVjZWl2ZWQuIFRoaXMgdGltZW91dCB3b3JrcyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gKlxuICogVmFsdWUgb2YgMCBvciBmYWxzZSBtZWFucyBubyB0aW1lb3V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0gbXMgb3Ige3Jlc3BvbnNlLCBkZWFkbGluZX1cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucztcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSAwO1xuICAgIHRoaXMuX3VwbG9hZFRpbWVvdXQgPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yIChjb25zdCBvcHRpb24gaW4gb3B0aW9ucykge1xuICAgIGlmIChoYXNPd24ob3B0aW9ucywgb3B0aW9uKSkge1xuICAgICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgICAgY2FzZSAnZGVhZGxpbmUnOlxuICAgICAgICAgIHRoaXMuX3RpbWVvdXQgPSBvcHRpb25zLmRlYWRsaW5lO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICAgICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gb3B0aW9ucy5yZXNwb25zZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBsb2FkJzpcbiAgICAgICAgICB0aGlzLl91cGxvYWRUaW1lb3V0ID0gb3B0aW9ucy51cGxvYWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHRpbWVvdXQgb3B0aW9uJywgb3B0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IG51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBvbiBlcnJvci5cbiAqXG4gKiBGYWlsZWQgcmVxdWVzdHMgd2lsbCBiZSByZXRyaWVkICdjb3VudCcgdGltZXMgaWYgdGltZW91dCBvciBlcnIuY29kZSA+PSA1MDAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnJldHJ5ID0gZnVuY3Rpb24gKGNvdW50LCBmbikge1xuICAvLyBEZWZhdWx0IHRvIDEgaWYgbm8gY291bnQgcGFzc2VkIG9yIHRydWVcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDAgfHwgY291bnQgPT09IHRydWUpIGNvdW50ID0gMTtcbiAgaWYgKGNvdW50IDw9IDApIGNvdW50ID0gMDtcbiAgdGhpcy5fbWF4UmV0cmllcyA9IGNvdW50O1xuICB0aGlzLl9yZXRyaWVzID0gMDtcbiAgdGhpcy5fcmV0cnlDYWxsYmFjayA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBOT1RFOiB3ZSBkbyBub3QgaW5jbHVkZSBFU09DS0VUVElNRURPVVQgYmVjYXVzZSB0aGF0IGlzIGZyb20gYHJlcXVlc3RgIHBhY2thZ2Vcbi8vICAgICAgIDxodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2dvdC9wdWxsLzUzNz5cbi8vXG4vLyBOT1RFOiB3ZSBkbyBub3QgaW5jbHVkZSBFQUREUklORk8gYmVjYXVzZSBpdCB3YXMgcmVtb3ZlZCBmcm9tIGxpYnV2IGluIDIwMTRcbi8vICAgICAgIDxodHRwczovL2dpdGh1Yi5jb20vbGlidXYvbGlidXYvY29tbWl0LzAyZTFlYmQ0MGI4MDdiZTVhZjQ2MzQzZWE4NzMzMzFiMmVlNGU5YzE+XG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL3JlcXVlc3QvcmVxdWVzdC9zZWFyY2g/cT1FU09DS0VUVElNRURPVVQmdW5zY29wZWRfcT1FU09DS0VUVElNRURPVVQ+XG4vL1xuLy9cbi8vIFRPRE86IGV4cG9zZSB0aGVzZSBhcyBjb25maWd1cmFibGUgZGVmYXVsdHNcbi8vXG5jb25zdCBFUlJPUl9DT0RFUyA9IG5ldyBTZXQoW1xuICAnRVRJTUVET1VUJyxcbiAgJ0VDT05OUkVTRVQnLFxuICAnRUFERFJJTlVTRScsXG4gICdFQ09OTlJFRlVTRUQnLFxuICAnRVBJUEUnLFxuICAnRU5PVEZPVU5EJyxcbiAgJ0VORVRVTlJFQUNIJyxcbiAgJ0VBSV9BR0FJTidcbl0pO1xuXG5jb25zdCBTVEFUVVNfQ09ERVMgPSBuZXcgU2V0KFtcbiAgNDA4LCA0MTMsIDQyOSwgNTAwLCA1MDIsIDUwMywgNTA0LCA1MjEsIDUyMiwgNTI0XG5dKTtcblxuLy8gVE9ETzogd2Ugd291bGQgbmVlZCB0byBtYWtlIHRoaXMgZWFzaWx5IGNvbmZpZ3VyYWJsZSBiZWZvcmUgYWRkaW5nIGl0IGluIChlLmcuIHNvbWUgbWlnaHQgd2FudCB0byBhZGQgUE9TVClcbi8vIGNvbnN0IE1FVEhPRFMgPSBuZXcgU2V0KFsnR0VUJywgJ1BVVCcsICdIRUFEJywgJ0RFTEVURScsICdPUFRJT05TJywgJ1RSQUNFJ10pO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHJlcXVlc3Qgc2hvdWxkIGJlIHJldHJpZWQuXG4gKiAoSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9nb3QjcmV0cnkpXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyIGFuIGVycm9yXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSBbcmVzXSByZXNwb25zZVxuICogQHJldHVybnMge0Jvb2xlYW59IGlmIHNlZ21lbnQgc2hvdWxkIGJlIHJldHJpZWRcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9zaG91bGRSZXRyeSA9IGZ1bmN0aW9uIChlcnJvciwgcmVzKSB7XG4gIGlmICghdGhpcy5fbWF4UmV0cmllcyB8fCB0aGlzLl9yZXRyaWVzKysgPj0gdGhpcy5fbWF4UmV0cmllcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXRyeUNhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlID0gdGhpcy5fcmV0cnlDYWxsYmFjayhlcnJvciwgcmVzKTtcbiAgICAgIGlmIChvdmVycmlkZSA9PT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyB1bmRlZmluZWQgZmFsbHMgYmFjayB0byBkZWZhdWx0c1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IHdlIHdvdWxkIG5lZWQgdG8gbWFrZSB0aGlzIGVhc2lseSBjb25maWd1cmFibGUgYmVmb3JlIGFkZGluZyBpdCBpbiAoZS5nLiBzb21lIG1pZ2h0IHdhbnQgdG8gYWRkIFBPU1QpXG4gIC8qXG4gIGlmIChcbiAgICB0aGlzLnJlcSAmJlxuICAgIHRoaXMucmVxLm1ldGhvZCAmJlxuICAgICFNRVRIT0RTLmhhcyh0aGlzLnJlcS5tZXRob2QudG9VcHBlckNhc2UoKSlcbiAgKVxuICAgIHJldHVybiBmYWxzZTtcbiAgKi9cbiAgaWYgKHJlcyAmJiByZXMuc3RhdHVzICYmIFNUQVRVU19DT0RFUy5oYXMocmVzLnN0YXR1cykpIHJldHVybiB0cnVlO1xuICBpZiAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IuY29kZSAmJiBFUlJPUl9DT0RFUy5oYXMoZXJyb3IuY29kZSkpIHJldHVybiB0cnVlO1xuICAgIC8vIFN1cGVyYWdlbnQgdGltZW91dFxuICAgIGlmIChlcnJvci50aW1lb3V0ICYmIGVycm9yLmNvZGUgPT09ICdFQ09OTkFCT1JURUQnKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZXJyb3IuY3Jvc3NEb21haW4pIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXRyeSByZXF1ZXN0XG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3JldHJ5ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gIC8vIG5vZGVcbiAgaWYgKHRoaXMucmVxKSB7XG4gICAgdGhpcy5yZXEgPSBudWxsO1xuICAgIHRoaXMucmVxID0gdGhpcy5yZXF1ZXN0KCk7XG4gIH1cblxuICB0aGlzLl9hYm9ydGVkID0gZmFsc2U7XG4gIHRoaXMudGltZWRvdXQgPSBmYWxzZTtcbiAgdGhpcy50aW1lZG91dEVycm9yID0gbnVsbDtcblxuICByZXR1cm4gdGhpcy5fZW5kKCk7XG59O1xuXG4vKipcbiAqIFByb21pc2Ugc3VwcG9ydFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZWplY3RdXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICBpZiAoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnV2FybmluZzogc3VwZXJhZ2VudCByZXF1ZXN0IHdhcyBzZW50IHR3aWNlLCBiZWNhdXNlIGJvdGggLmVuZCgpIGFuZCAudGhlbigpIHdlcmUgY2FsbGVkLiBOZXZlciBjYWxsIC5lbmQoKSBpZiB5b3UgdXNlIHByb21pc2VzJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYub24oJ2Fib3J0JywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fbWF4UmV0cmllcyAmJiB0aGlzLl9tYXhSZXRyaWVzID4gdGhpcy5fcmV0cmllcykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpbWVkb3V0ICYmIHRoaXMudGltZWRvdXRFcnJvcikge1xuICAgICAgICAgIHJlamVjdCh0aGlzLnRpbWVkb3V0RXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdBYm9ydGVkJyk7XG4gICAgICAgIGVycm9yLmNvZGUgPSAnQUJPUlRFRCc7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICAgICAgICBlcnJvci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgICAgICAgZXJyb3IudXJsID0gdGhpcy51cmw7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICAgIHNlbGYuZW5kKChlcnJvciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgZWxzZSByZXNvbHZlKHJlcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIGNhbGxiYWNrKTtcbn07XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLm9rID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgdGhpcy5fb2tDYWxsYmFjayA9IGNhbGxiYWNrO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5faXNSZXNwb25zZU9LID0gZnVuY3Rpb24gKHJlcykge1xuICBpZiAoIXJlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9va0NhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuX29rQ2FsbGJhY2socmVzKTtcbiAgfVxuXG4gIHJldHVybiByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwO1xufTtcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKiBUaGlzIGlzIGEgZGVwcmVjYXRlZCBpbnRlcm5hbCBBUEkuIFVzZSBgLmdldChmaWVsZClgIGluc3RlYWQuXG4gKlxuICogKGdldEhlYWRlciBpcyBubyBsb25nZXIgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBzdXBlcmFnZW50IGNvZGUgYmFzZSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICogQGRlcHJlY2F0ZWRcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0SGVhZGVyID0gUmVxdWVzdEJhc2UucHJvdG90eXBlLmdldDtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkKSB7XG4gICAgICBpZiAoaGFzT3duKGZpZWxkLCBrZXkpKSB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGQgZmllbGQgbmFtZVxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0XG4gKiBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoeyBmb286ICdiYXInLCBiYXo6ICdxdXgnIH0pXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBuYW1lIG5hbWUgb2YgZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZXxCdWZmZXJ8ZnMuUmVhZFN0cmVhbX0gdmFsIHZhbHVlIG9mIGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucyBleHRyYSBvcHRpb25zLCBlLmcuICdibG9iJ1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgLy8gbmFtZSBzaG91bGQgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdC5cbiAgaWYgKG5hbWUgPT09IG51bGwgfHwgdW5kZWZpbmVkID09PSBuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcuZmllbGQobmFtZSwgdmFsKSBuYW1lIGNhbiBub3QgYmUgZW1wdHknKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCIuZmllbGQoKSBjYW4ndCBiZSB1c2VkIGlmIC5zZW5kKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG5hbWUpIHtcbiAgICAgIGlmIChoYXNPd24obmFtZSwga2V5KSkgdGhpcy5maWVsZChrZXksIG5hbWVba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IGkgaW4gdmFsdWUpIHtcbiAgICAgIGlmIChoYXNPd24odmFsdWUsIGkpKSB0aGlzLmZpZWxkKG5hbWUsIHZhbHVlW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHZhbCBzaG91bGQgYmUgZGVmaW5lZCBub3dcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHVuZGVmaW5lZCA9PT0gdmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gIH1cblxuICAvLyBmaXggaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3N1cGVyYWdlbnQvaXNzdWVzLzE2ODBcbiAgaWYgKG9wdGlvbnMpIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKG5hbWUsIHZhbHVlLCBvcHRpb25zKTtcbiAgZWxzZSB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gcmVxdWVzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG4gIGlmICh0aGlzLnhocikgdGhpcy54aHIuYWJvcnQoKTsgLy8gYnJvd3NlclxuICBpZiAodGhpcy5yZXEpIHtcbiAgICAvLyBOb2RlIHYxMyBoYXMgbWFqb3IgZGlmZmVyZW5jZXMgaW4gYGFib3J0KClgXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjEyLngvbGliL2ludGVybmFsL3N0cmVhbXMvZW5kLW9mLXN0cmVhbS5qc1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL3YxMy54L2xpYi9pbnRlcm5hbC9zdHJlYW1zL2VuZC1vZi1zdHJlYW0uanNcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi92MTQueC9saWIvaW50ZXJuYWwvc3RyZWFtcy9lbmQtb2Ytc3RyZWFtLmpzXG4gICAgLy8gKGlmIHlvdSBydW4gYSBkaWZmIGFjcm9zcyB0aGVzZSB5b3Ugd2lsbCBzZWUgdGhlIGRpZmZlcmVuY2VzKVxuICAgIC8vXG4gICAgLy8gUmVmZXJlbmNlczpcbiAgICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy8zMTYzMD5cbiAgICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3N1cGVyYWdlbnQvcHVsbC8xMDg0L2NvbW1pdHMvZGMxODY3OWE3YzVjY2ZjNjA0NmQ4ODIwMTVlNTEyNjg4ODk3M2JjOD5cbiAgICAvL1xuICAgIC8vIFRoYW5rcyB0byBAc2hhZG93Z2F0ZTE1IGFuZCBAbmlmdHlsZXR0dWNlXG4gICAgaWYgKFxuICAgICAgc2VtdmVyLmd0ZShwcm9jZXNzLnZlcnNpb24sICd2MTMuMC4wJykgJiZcbiAgICAgIHNlbXZlci5sdChwcm9jZXNzLnZlcnNpb24sICd2MTQuMC4wJylcbiAgICApIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIHRoaXMgZG9lc24ndCB3b3JrIGlzIGJlY2F1c2UgaW4gdjEzIGFzIGNvbXBhcmVkIHRvIHYxNFxuICAgICAgLy8gdGhlcmUgaXMgbm8gYGNhbGxiYWNrID0gbm9wYCBzZXQgaW4gZW5kLW9mLXN0cmVhbS5qcyBhYm92ZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnU3VwZXJhZ2VudCBkb2VzIG5vdCB3b3JrIGluIHYxMyBwcm9wZXJseSB3aXRoIGFib3J0KCkgZHVlIHRvIE5vZGUuanMgY29yZSBjaGFuZ2VzJ1xuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHNlbXZlci5ndGUocHJvY2Vzcy52ZXJzaW9uLCAndjE0LjAuMCcpKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IHNldCBgZGVzdHJveWVkYCB0byBgdHJ1ZWAgaW4gb3JkZXIgZm9yIHRoaXMgdG8gd29ya1xuICAgICAgLy8gKHNlZSBjb3JlIGludGVybmFscyBvZiBlbmQtb2Ytc3RyZWFtLmpzIGFib3ZlIGluIHYxNCBicmFuY2ggYXMgY29tcGFyZWQgdG8gdjEyKVxuICAgICAgdGhpcy5yZXEuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnJlcS5hYm9ydCgpOyAvLyBub2RlXG4gIH1cblxuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hdXRoID0gZnVuY3Rpb24gKHVzZXIsIHBhc3MsIG9wdGlvbnMsIGJhc2U2NEVuY29kZXIpIHtcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCYXNpYyAke2Jhc2U2NEVuY29kZXIoYCR7dXNlcn06JHtwYXNzfWApfWApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VyO1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JlYXJlcic6IC8vIHVzYWdlIHdvdWxkIGJlIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyfWApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbiAob24pIHtcbiAgLy8gVGhpcyBpcyBicm93c2VyLW9ubHkgZnVuY3Rpb25hbGl0eS4gTm9kZSBzaWRlIGlzIG5vLW9wLlxuICBpZiAob24gPT09IHVuZGVmaW5lZCkgb24gPSB0cnVlO1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSBvbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgbWF4IHJlZGlyZWN0cyB0byBgbmAuIERvZXMgbm90aGluZyBpbiBicm93c2VyIFhIUiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZWRpcmVjdHMgPSBmdW5jdGlvbiAobikge1xuICB0aGlzLl9tYXhSZWRpcmVjdHMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWF4aW11bSBzaXplIG9mIGJ1ZmZlcmVkIHJlc3BvbnNlIGJvZHksIGluIGJ5dGVzLiBDb3VudHMgdW5jb21wcmVzc2VkIHNpemUuXG4gKiBEZWZhdWx0IDIwME1CLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuIG51bWJlciBvZiBieXRlc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5tYXhSZXNwb25zZVNpemUgPSBmdW5jdGlvbiAobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudCcpO1xuICB9XG5cbiAgdGhpcy5fbWF4UmVzcG9uc2VTaXplID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdG8gYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCAobm90IEpTT04gc3RyaW5nKSBvZiBzY2FsYXIgcHJvcGVydGllcy5cbiAqIE5vdGUgYXMgdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gcmV0dXJuIGEgdXNlZnVsIG5vbi10aGlzIHZhbHVlLFxuICogaXQgY2Fubm90IGJlIGNoYWluZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZXNjcmliaW5nIG1ldGhvZCwgdXJsLCBhbmQgZGF0YSBvZiB0aGlzIHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgIHVybDogdGhpcy51cmwsXG4gICAgZGF0YTogdGhpcy5fZGF0YSxcbiAgICBoZWFkZXJzOiB0aGlzLl9oZWFkZXJcbiAgfTtcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc3QgaXNPYmplY3RfID0gaXNPYmplY3QoZGF0YSk7XG4gIGxldCB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcblxuICBpZiAodGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIi5zZW5kKCkgY2FuJ3QgYmUgdXNlZCBpZiAuYXR0YWNoKCkgb3IgLmZpZWxkKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdF8gJiYgIXRoaXMuX2RhdGEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChkYXRhICYmIHRoaXMuX2RhdGEgJiYgdGhpcy5faXNIb3N0KHRoaXMuX2RhdGEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgbWVyZ2UgdGhlc2Ugc2VuZCBjYWxsc1wiKTtcbiAgfVxuXG4gIC8vIG1lcmdlXG4gIGlmIChpc09iamVjdF8gJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoaGFzT3duKGRhdGEsIGtleSkpIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZGVmYXVsdCB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBpZiAodHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhID8gYCR7dGhpcy5fZGF0YX0mJHtkYXRhfWAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIWlzT2JqZWN0XyB8fCB0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRlZmF1bHQgdG8ganNvblxuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU29ydCBgcXVlcnlzdHJpbmdgIGJ5IHRoZSBzb3J0IGZ1bmN0aW9uXG4gKlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIGRlZmF1bHQgb3JkZXJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KClcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBjdXN0b21pemVkIHNvcnQgZnVuY3Rpb25cbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KGZ1bmN0aW9uKGEsIGIpe1xuICogICAgICAgICAgIHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoO1xuICogICAgICAgICB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3J0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNvcnRRdWVyeSA9IGZ1bmN0aW9uIChzb3J0KSB7XG4gIC8vIF9zb3J0IGRlZmF1bHQgdG8gdHJ1ZSBidXQgb3RoZXJ3aXNlIGNhbiBiZSBhIGZ1bmN0aW9uIG9yIGJvb2xlYW5cbiAgdGhpcy5fc29ydCA9IHR5cGVvZiBzb3J0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBzb3J0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29tcG9zZSBxdWVyeXN0cmluZyB0byBhcHBlbmQgdG8gcmVxLnVybFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX2ZpbmFsaXplUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICBpZiAocXVlcnkpIHtcbiAgICB0aGlzLnVybCArPSAodGhpcy51cmwuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JykgKyBxdWVyeTtcbiAgfVxuXG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7IC8vIE1ha2VzIHRoZSBjYWxsIGlkZW1wb3RlbnRcblxuICBpZiAodGhpcy5fc29ydCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy51cmwuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBxdWVyeUFycmF5ID0gdGhpcy51cmwuc2xpY2UoaW5kZXggKyAxKS5zcGxpdCgnJicpO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zb3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCh0aGlzLl9zb3J0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVybCA9IHRoaXMudXJsLnNsaWNlKDAsIGluZGV4KSArICc/JyArIHF1ZXJ5QXJyYXkuam9pbignJicpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRm9yIGJhY2t3YXJkcyBjb21wYXQgb25seVxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCcpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fdGltZW91dEVycm9yID0gZnVuY3Rpb24gKHJlYXNvbiwgdGltZW91dCwgZXJybm8pIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgJHtyZWFzb24gKyB0aW1lb3V0fW1zIGV4Y2VlZGVkYCk7XG4gIGVycm9yLnRpbWVvdXQgPSB0aW1lb3V0O1xuICBlcnJvci5jb2RlID0gJ0VDT05OQUJPUlRFRCc7XG4gIGVycm9yLmVycm5vID0gZXJybm87XG4gIHRoaXMudGltZWRvdXQgPSB0cnVlO1xuICB0aGlzLnRpbWVkb3V0RXJyb3IgPSBlcnJvcjtcbiAgdGhpcy5hYm9ydCgpO1xuICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2V0VGltZW91dHMgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIC8vIGRlYWRsaW5lXG4gIGlmICh0aGlzLl90aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoJ1RpbWVvdXQgb2YgJywgc2VsZi5fdGltZW91dCwgJ0VUSU1FJyk7XG4gICAgfSwgdGhpcy5fdGltZW91dCk7XG4gIH1cblxuICAvLyByZXNwb25zZSB0aW1lb3V0XG4gIGlmICh0aGlzLl9yZXNwb25zZVRpbWVvdXQgJiYgIXRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1Jlc3BvbnNlIHRpbWVvdXQgb2YgJyxcbiAgICAgICAgc2VsZi5fcmVzcG9uc2VUaW1lb3V0LFxuICAgICAgICAnRVRJTUVET1VUJ1xuICAgICAgKTtcbiAgICB9LCB0aGlzLl9yZXNwb25zZVRpbWVvdXQpO1xuICB9XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VCYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlQmFzZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZUJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2VCYXNlKCkge31cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5fc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgLy8gVE9ETzogbW9hciFcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGEgdXRpbFxuXG4gIC8vIGNvbnRlbnQtdHlwZVxuICBjb25zdCBjdCA9IGhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHV0aWxzLnR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICBjb25zdCBwYXJhbWV0ZXJzID0gdXRpbHMucGFyYW1zKGN0KTtcbiAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGFyYW1ldGVycywga2V5KSlcbiAgICAgIHRoaXNba2V5XSA9IHBhcmFtZXRlcnNba2V5XTtcbiAgfVxuXG4gIHRoaXMubGlua3MgPSB7fTtcblxuICAvLyBsaW5rc1xuICB0cnkge1xuICAgIGlmIChoZWFkZXIubGluaykge1xuICAgICAgdGhpcy5saW5rcyA9IHV0aWxzLnBhcnNlTGlua3MoaGVhZGVyLmxpbmspO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gaWdub3JlXG4gIH1cbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5fc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgY29uc3QgdHlwZSA9IE1hdGgudHJ1bmMoc3RhdHVzIC8gMTAwKTtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSB0eXBlID09PSAxO1xuICB0aGlzLm9rID0gdHlwZSA9PT0gMjtcbiAgdGhpcy5yZWRpcmVjdCA9IHR5cGUgPT09IDM7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSB0eXBlID09PSA0O1xuICB0aGlzLnNlcnZlckVycm9yID0gdHlwZSA9PT0gNTtcbiAgdGhpcy5lcnJvciA9IHR5cGUgPT09IDQgfHwgdHlwZSA9PT0gNSA/IHRoaXMudG9FcnJvcigpIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5jcmVhdGVkID0gc3RhdHVzID09PSAyMDE7XG4gIHRoaXMuYWNjZXB0ZWQgPSBzdGF0dXMgPT09IDIwMjtcbiAgdGhpcy5ub0NvbnRlbnQgPSBzdGF0dXMgPT09IDIwNDtcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gc3RhdHVzID09PSA0MDA7XG4gIHRoaXMudW5hdXRob3JpemVkID0gc3RhdHVzID09PSA0MDE7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IHN0YXR1cyA9PT0gNDA2O1xuICB0aGlzLmZvcmJpZGRlbiA9IHN0YXR1cyA9PT0gNDAzO1xuICB0aGlzLm5vdEZvdW5kID0gc3RhdHVzID09PSA0MDQ7XG4gIHRoaXMudW5wcm9jZXNzYWJsZUVudGl0eSA9IHN0YXR1cyA9PT0gNDIyO1xufTtcbiIsIi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnR5cGUgPSAoc3RyaW5nXykgPT4gc3RyaW5nXy5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcmFtcyA9ICh2YWx1ZSkgPT4ge1xuICBjb25zdCBvYmplY3QgPSB7fTtcbiAgZm9yIChjb25zdCBzdHJpbmdfIG9mIHZhbHVlLnNwbGl0KC8gKjsgKi8pKSB7XG4gICAgY29uc3QgcGFydHMgPSBzdHJpbmdfLnNwbGl0KC8gKj0gKi8pO1xuICAgIGNvbnN0IGtleSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWx1ZSkgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG4vKipcbiAqIFBhcnNlIExpbmsgaGVhZGVyIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcnNlTGlua3MgPSAodmFsdWUpID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0ge307XG4gIGZvciAoY29uc3Qgc3RyaW5nXyBvZiB2YWx1ZS5zcGxpdCgvICosICovKSkge1xuICAgIGNvbnN0IHBhcnRzID0gc3RyaW5nXy5zcGxpdCgvICo7ICovKTtcbiAgICBjb25zdCB1cmwgPSBwYXJ0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgY29uc3QgcmVsID0gcGFydHNbMV0uc3BsaXQoLyAqPSAqLylbMV0uc2xpY2UoMSwgLTEpO1xuICAgIG9iamVjdFtyZWxdID0gdXJsO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cbi8qKlxuICogU3RyaXAgY29udGVudCByZWxhdGVkIGZpZWxkcyBmcm9tIGBoZWFkZXJgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEByZXR1cm4ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmNsZWFuSGVhZGVyID0gKGhlYWRlciwgY2hhbmdlc09yaWdpbikgPT4ge1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgZGVsZXRlIGhlYWRlclsnY29udGVudC1sZW5ndGgnXTtcbiAgZGVsZXRlIGhlYWRlclsndHJhbnNmZXItZW5jb2RpbmcnXTtcbiAgZGVsZXRlIGhlYWRlci5ob3N0O1xuICAvLyBzZWN1aXJ0eVxuICBpZiAoY2hhbmdlc09yaWdpbikge1xuICAgIGRlbGV0ZSBoZWFkZXIuYXV0aG9yaXphdGlvbjtcbiAgICBkZWxldGUgaGVhZGVyLmNvb2tpZTtcbiAgfVxuXG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydHMuaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XG4gIHJldHVybiBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG59O1xuXG4vKipcbiAqIE9iamVjdC5oYXNPd24gZmFsbGJhY2svcG9seWZpbGwuXG4gKlxuICogQHR5cGUgeyhvYmplY3Q6IG9iamVjdCwgcHJvcGVydHk6IHN0cmluZykgPT4gYm9vbGVhbn0gb2JqZWN0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0cy5oYXNPd24gPVxuICBPYmplY3QuaGFzT3duIHx8XG4gIGZ1bmN0aW9uIChvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5ldyBPYmplY3Qob2JqZWN0KSwgcHJvcGVydHkpO1xuICB9O1xuXG5leHBvcnRzLm1peGluID0gKHRhcmdldCwgc291cmNlKSA9PiB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgIGlmIChleHBvcnRzLmhhc093bihzb3VyY2UsIGtleSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG59O1xuIiwidmFyIHNjb3BlID0gKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgJiYgZ2xvYmFsKSB8fFxuICAgICAgICAgICAgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGYpIHx8XG4gICAgICAgICAgICB3aW5kb3c7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCBzY29wZSwgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCBzY29wZSwgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkge1xuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVvdXQuY2xvc2UoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbChzY29wZSwgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIHNldGltbWVkaWF0ZSBhdHRhY2hlcyBpdHNlbGYgdG8gdGhlIGdsb2JhbCBvYmplY3RcbnJlcXVpcmUoXCJzZXRpbW1lZGlhdGVcIik7XG4vLyBPbiBzb21lIGV4b3RpYyBlbnZpcm9ubWVudHMsIGl0J3Mgbm90IGNsZWFyIHdoaWNoIG9iamVjdCBgc2V0aW1tZWRpYXRlYCB3YXNcbi8vIGFibGUgdG8gaW5zdGFsbCBvbnRvLiAgU2VhcmNoIGVhY2ggcG9zc2liaWxpdHkgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhlXG4vLyBgc2V0aW1tZWRpYXRlYCBsaWJyYXJ5LlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZi5zZXRJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIGdsb2JhbC5zZXRJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICh0aGlzICYmIHRoaXMuc2V0SW1tZWRpYXRlKTtcbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZi5jbGVhckltbWVkaWF0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWwuY2xlYXJJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMgJiYgdGhpcy5jbGVhckltbWVkaWF0ZSk7XG4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IG5ldyBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG59IGNhdGNoIChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKSBnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG4iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iXSwic291cmNlUm9vdCI6IiJ9