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
const calendar_1 = require("./calendar");
const data_1 = require("./data");
const set_state_1 = require("./set_state");
function setBreakday() {
    (0, calendar_1.getCalendarList)().then((calendarsMeta) => {
        calendarsMeta.forEach((calendar) => {
            (0, data_1.getData)(calendar.filename).then((data) => {
                var weekday = new Date().getDay();
                if (data.firstDayOfWeek == 1) {
                    weekday--;
                    if (weekday == -1)
                        weekday = 6;
                }
                if (!data.agenda[weekday]) {
                    if ((0, data_1.findDayInData)(data, (0, calendar_1.dateString)(new Date())).state == "fail") {
                        (0, set_state_1.setState)(calendar.filename, (0, calendar_1.dateString)(new Date()), "breakday");
                    }
                }
            }).catch(() => {
                console.error("error in getData (daemons.ts, setBreakday())");
            });
        });
    }).catch((err) => {
        console.error(err);
    });
}
function runDaemons() {
    var commandsListPath = path_1.default.join(__dirname, "../../", "daemons", "commands.list");
    var logPath = path_1.default.join(__dirname, "../../", "daemons", "daemons.log");
    new Promise((resolve, reject) => {
        fs_1.default.access(commandsListPath, (err) => {
            if (err) {
                console.error(err);
                reject();
            }
            var rl = readline_1.default.createInterface({ input: fs_1.default.createReadStream(commandsListPath) });
            var execPromises = Array();
            rl.on('line', (line) => {
                execPromises.push(new Promise((resolve, reject) => {
                    (0, child_process_1.exec)(line, (error, stdout, stderr) => {
                        var startDate = new Date();
                        var commandReturn;
                        if (error)
                            commandReturn = `error: ${error.message}`;
                        else if (stderr)
                            commandReturn = `command error: ${stderr}`;
                        else
                            commandReturn = `${stdout}`;
                        commandReturn = `\n${startDate.toISOString()} => ${line} : ${commandReturn.trim()}`;
                        fs_1.default.appendFile(logPath, commandReturn, 'utf-8', (err) => {
                            if (err) {
                                console.error(err);
                                reject();
                            }
                            resolve();
                        });
                    });
                }));
            });
            rl.on('close', () => {
                Promise.allSettled(execPromises).then(() => {
                    resolve();
                });
            });
        });
    }).finally(() => {
        setBreakday();
    });
}
exports.runDaemons = runDaemons;
