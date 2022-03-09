"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countStreaks = exports.findDayInData = exports.getStreaks = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
/**
 * Returns a StreaksFile, which contains the contents of the specified streaks file
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @returns - A promise that resolve(StreaksFile) or reject(void)
 */
function getStreaks(filename) {
    return new Promise((resolve, reject) => {
        var dataPath = path_1.default.join(__dirname, "../../", "streaks", filename);
        var data;
        fs_1.default.readFile(dataPath, 'utf-8', (err, dataString) => {
            if (err)
                return reject();
            try {
                data = JSON.parse(dataString);
            }
            catch (e) {
                return reject();
            }
            data.filename = path_1.default.basename(dataPath);
            resolve(data);
        });
    });
}
exports.getStreaks = getStreaks;
/**
 * Returns a StreaksFileDay; the data of the specified day for the specified calendar
 * @param data - A StreaksFile to search in
 * @param date - The date formatted as YYYY-MM-DD
 * @returns - StreaksFileDay requested. If it does not exist, return a StreaksFileDay with a state of fail
 */
function findDayInData(data, date) {
    var dataDay = {
        date: date,
        state: "fail"
    };
    for (let cur = 0; cur < data.days.length; cur++) {
        if (data.days[cur].date == date) {
            if (!["fail", "freeze", "breakday", "success"].includes(data.days[cur].state))
                break;
            dataDay = data.days[cur];
        }
    }
    return (dataDay);
}
exports.findDayInData = findDayInData;
/**
 * Returns the current streaks of the specified calendar
 * @param data - The StreaksFile to count in
 * @returns - The current streaks (a number)
 */
function countStreaks(data) {
    var date = new Date();
    var streaks = 0;
    var current_state;
    current_state = findDayInData(data, (0, utils_1.dateString)(date)).state;
    do {
        if (current_state == "success")
            streaks++;
        date.setDate(date.getDate() - 1);
        current_state = findDayInData(data, (0, utils_1.dateString)(date)).state;
    } while (current_state != "fail");
    return (streaks);
}
exports.countStreaks = countStreaks;
