"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendar = exports.isOver = void 0;
const path_1 = __importDefault(require("path"));
function dateString(date) {
    return (date.toISOString().split('T')[0]);
}
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
    while (findDayInData(data, dateString(date)).state != "fail" || isToday(date)) {
        streaks++;
        date.setDate(date.getDate() - 1);
    }
    date.setDate(date.getDate() + 1);
    if (streaks == 1 && findDayInData(data, dateString(date)).state == "fail")
        streaks = 0;
    return (streaks);
}
function getCalendar(monthDate, dataPath) {
    var calendar = { first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false };
    var dateCalendar = getCalendarArray(monthDate);
    var daysNum = dateCalendar.length;
    var data = require(path_1.default.join("../../", "streaks", dataPath));
    calendar.first_index = (7 + dateCalendar[0].getDay() - data.firstDayOfWeek - 1) % 7;
    calendar.days = Array(daysNum);
    calendar.currentStreaks = countStreaks(data);
    calendar.streaksExpandedToday = findDayInData(data, dateString(new Date())).state != "fail";
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
        dataDay = findDayInData(data, calendar.days[cur].dateString);
        calendar.days[cur].state = dataDay.state;
    }
    if (data.firstDayOfWeek)
        calendar.firstDayOfWeek = 1;
    return (calendar);
}
exports.getCalendar = getCalendar;
