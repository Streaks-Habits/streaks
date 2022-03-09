"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOver = exports.isToday = exports.dateString = void 0;
/**
 * Converts a date into a string format as follows YYYY-MM-DD
 * @param date - The date to convert
 * @returns - A string of characters representing a date in YYYY-MM-DD format
 */
function dateString(date) {
    return (date.toISOString().split('T')[0]);
}
exports.dateString = dateString;
/**
 * @returns - True if the date is the same as today's date
 * @param date - The date to compare with today date
 * @remark - Compares year, month and day, not hours/minutes
 */
function isToday(date) {
    var today = new Date();
    if (dateString(today) == dateString(date))
        return (true);
    return (false);
}
exports.isToday = isToday;
/**
 * @returns - Return true if the specified date is in the past or is today
 * @param date - The date to compare
 * @remark - Compares year, month and day, not hours/minutes
 */
function isOver(date) {
    var today = new Date();
    if (date < today || isToday(date))
        return (true);
    return (false);
}
exports.isOver = isOver;
