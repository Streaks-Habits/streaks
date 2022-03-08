"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarList = exports.getCalendar = exports.isOver = exports.dateString = void 0;
const fs_1 = __importDefault(require("fs"));
const data_1 = require("./data");
function dateString(date) {
    return (date.toISOString().split('T')[0]);
}
exports.dateString = dateString;
function getCalendarArray(monthDate) {
    var calendar;
    var firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 2);
    var lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    calendar = Array(lastDay);
    for (let cur = 0; cur < lastDay; cur++) {
        var date = new Date(firstDay);
        date.setDate(firstDay.getDate() + cur);
        calendar[cur] = date;
    }
    return (calendar);
}
function isToday(date) {
    var today = new Date();
    if (today.toISOString().split('T')[0] ==
        date.toISOString().split('T')[0])
        return (true);
    return (false);
}
function isOver(date) {
    var today = new Date();
    if (date < today || isToday(date))
        return (true);
    return (false);
}
exports.isOver = isOver;
function countStreaks(data) {
    var date = new Date();
    var streaks = 0;
    var current_state;
    current_state = (0, data_1.findDayInData)(data, dateString(date)).state;
    do {
        if (current_state == "success")
            streaks++;
        date.setDate(date.getDate() - 1);
        current_state = (0, data_1.findDayInData)(data, dateString(date)).state;
    } while (current_state != "fail");
    return (streaks);
}
function getCalendar(monthDate, dataPath) {
    return new Promise((resolve, reject) => {
        var calendar = { first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false };
        var dateCalendar = getCalendarArray(monthDate);
        var daysNum = dateCalendar.length;
        (0, data_1.getData)(dataPath).then((data) => {
            calendar.first_index = (7 + dateCalendar[0].getDay() - data.firstDayOfWeek - 1) % 7;
            calendar.days = Array(daysNum);
            calendar.currentStreaks = countStreaks(data);
            calendar.streaksExpandedToday = (0, data_1.findDayInData)(data, dateString(new Date())).state != "fail";
            for (let cur = 0; cur < daysNum; cur++) {
                let dataDay;
                calendar.days[cur] = {
                    date: dateCalendar[cur],
                    dateString: "",
                    dayNum: cur + 1,
                    state: "",
                    isToday: isToday(dateCalendar[cur]),
                    isOver: isOver(dateCalendar[cur])
                };
                calendar.days[cur].dateString = dateString(calendar.days[cur].date);
                dataDay = (0, data_1.findDayInData)(data, calendar.days[cur].dateString);
                calendar.days[cur].state = dataDay.state;
            }
            if (data.firstDayOfWeek)
                calendar.firstDayOfWeek = 1;
            resolve(calendar);
        }).catch(() => {
            reject("error in getData (calendar.ts, getCalendar())");
        });
    });
}
exports.getCalendar = getCalendar;
function getCalendarList() {
    return new Promise((resolve, reject) => {
        var calendarList = new Array();
        fs_1.default.readdir("./streaks", (err, files) => {
            if (err)
                return reject("error in getCalendarList (calendar.ts)");
            var getDataPromises = Array();
            for (let file of files)
                getDataPromises.push((0, data_1.getData)(file));
            Promise.allSettled(getDataPromises).then((results) => {
                results.forEach((result) => {
                    if (result.status == 'fulfilled') {
                        calendarList.push({
                            name: result.value.name,
                            filename: result.value.filename
                        });
                    }
                });
                resolve(calendarList);
            });
        });
    });
}
exports.getCalendarList = getCalendarList;
