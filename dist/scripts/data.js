"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDayInData = exports.getData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getData(filename) {
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
exports.getData = getData;
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
