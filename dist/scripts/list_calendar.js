"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarList = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getCalendarList() {
    return new Promise((res, _rej) => {
        var calendarList = new Array();
        fs_1.default.readdir("./streaks", (err, files) => {
            if (err)
                throw err;
            for (let file of files) {
                if (file.endsWith(".streaks.json") && fs_1.default.lstatSync(`./streaks/${file}`).isFile()) {
                    let data = require(path_1.default.join("../../streaks", file));
                    calendarList.push({
                        name: data.name,
                        filename: file
                    });
                }
            }
            res(calendarList);
        });
    });
}
exports.getCalendarList = getCalendarList;
