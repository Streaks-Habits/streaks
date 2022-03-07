"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDaemons = void 0;
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
function runDaemons() {
    var commandsListPath = path_1.default.join(__dirname, "../../", "daemons", "commands.list");
    var logPath = path_1.default.join(__dirname, "../../", "daemons", "daemons.log");
    var rl = readline_1.default.createInterface({ input: fs_1.default.createReadStream(commandsListPath) });
    rl.on('line', (line) => {
        var startDate = new Date();
        var commandReturn;
        (0, child_process_1.exec)(line, (error, stdout, stderr) => {
            if (error)
                commandReturn = `error: ${error.message}`;
            else if (stderr)
                commandReturn = `command error: ${stderr}`;
            else
                commandReturn = `${stdout}`;
            commandReturn = `\n${startDate.toISOString()} => ${line}\n  > ${commandReturn}`;
            fs_1.default.appendFile(logPath, commandReturn, 'utf-8', (err) => {
                if (err)
                    throw err;
            });
        });
    });
}
exports.runDaemons = runDaemons;
