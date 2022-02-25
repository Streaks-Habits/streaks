"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const calendar_1 = require("./calendar");
function setState(filename, dateString, state) {
    return new Promise((res, _rej) => {
        let file = path_1.default.join("../../streaks", filename);
        let data = require(file);
        let set = false;
        if (!(0, calendar_1.isOver)(new Date(dateString)))
            res();
        if (!["fail", "freeze", "breakday", "success"].includes(state))
            res();
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
                throw err;
            res();
        });
    });
}
exports.setState = setState;
