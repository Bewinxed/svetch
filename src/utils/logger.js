"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
var Log = /** @class */ (function () {
    function Log(logLevel, filter) {
        if (logLevel === void 0) { logLevel = 5; }
        if (filter === void 0) { filter = null; }
        this.console_colors = {
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            gray: '\x1b[90m',
            reset: '\x1b[0m',
            black: '\x1b[30m'
        };
        // default log level is 5, which shows all logs
        this.logLevel = logLevel;
        this.filter = filter;
    }
    Log.prototype.log = function (color, nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var formattedArgs = args.map(function (arg) {
            if (typeof arg === 'object') {
                // Convert the object to a JSON string with 2-space indentation
                var json = JSON.stringify(arg, null, 2);
                // Split the JSON string into lines so we can add indentation to each line
                var lines = json.split('\n');
                // Add the appropriate indentation to each line
                var padding_1 = '    '.repeat(nesting);
                lines = lines.map(function (line) {
                    // Check if line is a valid JSON string, if so parse it
                    try {
                        var parsedJSON = JSON.parse(line.trim());
                        // If it's parsable, it's a stringified JSON, so we format it with the appropriate indentation
                        return (padding_1 +
                            JSON.stringify(parsedJSON, null, 2).replace(/\n/g, '\n' + padding_1));
                    }
                    catch (e) {
                        // If it's not parsable, it's a regular string so we just return it
                        return padding_1 + line;
                    }
                });
                // Join the lines back together into a single string
                return lines.join('\n');
            }
            else {
                // Non-object arguments are not modified
                return arg;
            }
        });
        console.log("".concat(this.console_colors[color]).concat('    '.repeat(nesting - 1)).concat(nesting > 1 ? '↳  ' : '').concat(formattedArgs.join(' ')).concat(this.console_colors.reset));
    };
    Log.prototype.header = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.logLevel >= 0 && (!this.filter || this.filter === 'header')) {
            this.log.apply(this, __spreadArray(['cyan', nesting], args, false));
        }
    };
    Log.prototype.success = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.logLevel >= 1 && (!this.filter || this.filter === 'success')) {
            this.log.apply(this, __spreadArray(['green', nesting, '✅ [SUCCESS]:	'], args, false));
        }
    };
    Log.prototype.info = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.logLevel >= 2 && (!this.filter || this.filter === 'info')) {
            this.log.apply(this, __spreadArray(['blue', nesting, '🗒 [INFO]:	'], args, false));
        }
    };
    Log.prototype.warn = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.logLevel >= 3 && (!this.filter || this.filter === 'warn')) {
            this.log.apply(this, __spreadArray(['yellow', nesting, '⚠️ [WARN]:	'], args, false));
        }
    };
    Log.prototype.error = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // telemetryPayload.data.encountered_errors = true;
        // telemetryPayload.data.error_messages.push(args.join(' '));
        if (this.logLevel >= 4 && (!this.filter || this.filter === 'error')) {
            this.log.apply(this, __spreadArray(['red', nesting, '🚨 [ERROR]:	'], args, false));
        }
    };
    Log.prototype.debug = function (nesting) {
        if (nesting === void 0) { nesting = 1; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.logLevel >= 5 && (!this.filter || this.filter === 'debug')) {
            this.log.apply(this, __spreadArray(['gray', nesting, '🐛 [DEBUG]:	'], args, false));
        }
    };
    return Log;
}());
exports.log = new Log();
