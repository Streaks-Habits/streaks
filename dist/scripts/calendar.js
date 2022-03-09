"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarList = exports.getCalendar = void 0;
const fs_1 = __importDefault(require("fs"));
const data_1 = require("./data");
const utils_1 = require("./utils");
/**
 * Returns a table of each date of the specified month. From the first day of the month to the last day of the month
 * @param monthDate - A date that is included in the desired month
 * @returns - An Array<Date> of the month
 */
function createMonthArray(monthDate) {
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
/**
 * Retrieves the contents of the specified streaks file and returns data for the specified month
 * @param monthDate - A date that is included in the desired month
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @returns - A promise that resolve(Calendar) or reject(errorMessage)
 */
function getCalendar(monthDate, filename) {
    return new Promise((resolve, reject) => {
        var calendar = { first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false };
        var monthArray = createMonthArray(monthDate);
        var daysNum = monthArray.length;
        (0, data_1.getStreaks)(filename).then((data) => {
            calendar.first_index = (7 + monthArray[0].getDay() - data.firstDayOfWeek - 1) % 7;
            calendar.days = Array(daysNum);
            calendar.currentStreaks = (0, data_1.countStreaks)(data);
            calendar.streaksExpandedToday = (0, data_1.findDayInData)(data, (0, utils_1.dateString)(new Date())).state != "fail";
            for (let cur = 0; cur < daysNum; cur++) {
                let StreaksFileDay;
                calendar.days[cur] = {
                    date: monthArray[cur],
                    dateString: "",
                    dayNum: cur + 1,
                    state: "",
                    isToday: (0, utils_1.isToday)(monthArray[cur]),
                    isOver: (0, utils_1.isOver)(monthArray[cur])
                };
                calendar.days[cur].dateString = (0, utils_1.dateString)(calendar.days[cur].date);
                StreaksFileDay = (0, data_1.findDayInData)(data, calendar.days[cur].dateString);
                calendar.days[cur].state = StreaksFileDay.state;
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
/**
 * Returns a list of calendars contained in the streaks folder
 * @returns - A promise that resolve(Array<CalendarMeta>) or reject(errorMessage)
 */
function getCalendarList() {
    return new Promise((resolve, reject) => {
        var calendarList = new Array();
        fs_1.default.readdir("./streaks", (err, files) => {
            if (err)
                return reject("error in getCalendarList (calendar.ts)");
            var getDataPromises = Array();
            for (let file of files)
                getDataPromises.push((0, data_1.getStreaks)(file));
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
