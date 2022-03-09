"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
/**
 * Returns a promise that sets the specified state to the specified day on the specified calendar
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @param dateString - The date formatted as YYYY-MM-DD
 * @param state - The state to define can be: success, fail, breakday, freeze
 * @returns - A promise that can resolve(void) or reject(errorMessage)
 */
function setState(filename, dateString, state) {
    return new Promise((resolve, reject) => {
        let file = path_1.default.join("../../streaks", filename);
        let data = require(file);
        let set = false;
        if (!(0, utils_1.isOver)(new Date(dateString)))
            reject("Date is not over");
        if (!["fail", "freeze", "breakday", "success"].includes(state))
            reject("State doesn't exist");
        for (let cur = 0; cur < data.days.length; cur++) {
            if (data.days[cur].date == dateString) {
                data.days[cur].state = state;
                set = true;
            }
        }
        if (!set) {
            data.days.push({
                date: dateString,
                state: state
            });
        }
        fs_1.default.writeFile(`./streaks/${filename}`, JSON.stringify(data, null, '\t'), (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.setState = setState;
