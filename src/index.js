"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAll = runAll;
var node_path_1 = require("node:path");
var node_child_process_1 = require("node:child_process");
var inquirer_1 = require("inquirer");
var separator = '--------------------------------------';
function readSvetchrc() {
    try {
        var config = fs_1.default.readFileSync('.svetchrc', 'utf8');
        return JSON.parse(config);
    }
    catch (error) {
        console.error('Error reading .svetchrc file:', error);
        process.exit(1);
    }
}
var defaultArgs = {
    framework: 'sveltekit',
    input: 'src/routes/api',
    out: 'src/lib/api',
    docs: 'src/routes/docs',
    staticFolder: 'static',
    tsconfig: 'tsconfig.json',
    logLevel: 5,
    filter: null,
    telemetry: true
};
var isInit = process.argv[2] === 'init';
// Get the command-line arguments
var args = process.argv.slice(3); // Exclude the first two elements (node binary and script file path)
function parseArgs(rawArgs) {
    var _a;
    // Check if .svetchrc file exists
    var svetchrcExists = fs_1.default.existsSync('.svetchrc');
    // Use .svetchrc file if it exists
    var parsedArgs = svetchrcExists ? readSvetchrc() : {};
    // Parse command-line arguments
    for (var i = 0; i < rawArgs.length; i += 2) {
        var argName = (_a = rawArgs[i]) === null || _a === void 0 ? void 0 : _a.replace('--', '');
        var argValue = rawArgs[i + 1];
        if (argName && argValue) {
            parsedArgs[argName] = argValue;
        }
    }
    // Merge parsed arguments with default values
    return __assign(__assign({}, defaultArgs), parsedArgs);
}
var fs_1 = require("fs");
var logger_1 = require("./utils/logger");
var generator_1 = require("./generator");
var workingDir = (_a = process.env.PWD) !== null && _a !== void 0 ? _a : process.cwd();
function initSvetchrc() {
    return __awaiter(this, void 0, void 0, function () {
        var responses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if the configuration file already exists
                    console.log("\n  _____               _          _     \n / ____|             | |        | |    \n| (___  __   __  ___ | |_   ___ | |__  \n \\___ \\ \\ \\ / / / _ \\| __| / __|| '_ \\ \n ____) | \\ V / |  __/| |_ | (__ | | | |\n|_____/   \\_/   \\___| \\__| \\___||_| |_|\n                                       \nSend any feedback or issues here \uD83D\uDC49 https://github.com/Bewinxed/svetch/\n");
                    console.log("".concat(separator, "\nTypesafety, without the typing ;)\n").concat(separator, "\n"));
                    if (fs_1.default.existsSync('.svetchrc')) {
                        fs_1.default.renameSync('.svetchrc', '.svetchrc.backup');
                        console.log('Existing .svetchrc file has been renamed to .svetchrc.backup');
                    }
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            // {
                            //   name: 'framework',
                            //   message: 'What is your framework?',
                            //   default: defaultArgs.framework,
                            // },
                            {
                                name: 'input',
                                message: "Which folder would you like svetch to scan for API routes? - default: ".concat(defaultArgs.input),
                                default: defaultArgs.input
                            },
                            {
                                name: 'out',
                                message: "".concat(separator, "\nWhere would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here) - default: ").concat(defaultArgs.out),
                                default: defaultArgs.out
                            },
                            {
                                name: 'docs',
                                message: "".concat(separator, "\nWhere would you like svetch to output the generated API documentation? - default: ").concat(defaultArgs.docs),
                                default: defaultArgs.docs
                            },
                            {
                                name: 'staticFolder',
                                message: "".concat(separator, "\nWhere is your static folder located?\n - default: ").concat(defaultArgs.staticFolder),
                                default: defaultArgs.staticFolder
                            }
                        ])];
                case 1:
                    responses = _a.sent();
                    fs_1.default.writeFileSync('.svetchrc', JSON.stringify(__assign(__assign({}, defaultArgs), responses), null, 2));
                    logger_1.log.success(1, "Svetch configuration written to ".concat(node_path_1.default.resolve(workingDir, '.svetchrc'), "\n\nenjoy ;)\n\n").concat(separator));
                    return [2 /*return*/];
            }
        });
    });
}
var packageJson = require(node_path_1.default.resolve(__dirname, '../package.json'));
function checkVersion() {
    var packageName = packageJson.name;
    var currentVersion = packageJson.version;
    (0, node_child_process_1.exec)("npm show ".concat(packageName, " version"), function (err, stdout, stderr) {
        if (err) {
            console.error("exec error: ".concat(err));
            return;
        }
        var latestVersion = stdout.trim();
        // telemetryPayload.data.script_version = currentVersion;
        console.log("Current version: ".concat(currentVersion));
        console.log("Latest version: ".concat(latestVersion));
        if (currentVersion !== latestVersion) {
            console.log("A newer version of ".concat(packageName, " is available."));
        }
        else {
            console.log("You are using the latest version of ".concat(packageName, "."));
        }
    });
}
function runAll() {
    if (isInit || !fs_1.default.existsSync(node_path_1.default.resolve(workingDir, '.svetchrc'))) {
        initSvetchrc().then(function () {
            checkVersion();
            (0, generator_1.main)(parseArgs(args));
        });
    }
    else {
        checkVersion();
        (0, generator_1.main)(parseArgs(args));
    }
}
