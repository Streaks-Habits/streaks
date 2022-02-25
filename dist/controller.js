"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthenticated = exports.stateSet = exports.loginForm = exports.loginView = exports.calendarView = exports.dashboardView = exports.servePublic = exports.serveStyles = exports.index = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const calendar_1 = require("./scripts/calendar");
const list_calendar_1 = require("./scripts/list_calendar");
const set_state_1 = require("./scripts/set_state");
const index = (req, res) => {
    res.redirect("/dashboard");
};
exports.index = index;
exports.serveStyles = express_1.default.static(path_1.default.join(__dirname, "public"), {
    fallthrough: true
});
exports.servePublic = express_1.default.static(path_1.default.join(__dirname, "../", "src", "public"), {
    fallthrough: true
});
const dashboardView = (req, res) => {
    var date = new Date();
    var dateStr = `${date.getFullYear()}-${date.getMonth() + 1}`;
    (0, list_calendar_1.getCalendarList)().then((calendarList) => {
        res.render("dashboard", { calendars: calendarList, dateStr: dateStr });
    });
};
exports.dashboardView = dashboardView;
const calendarView = (req, res) => {
    var date = new Date();
    var dateString;
    if (req.query.date) {
        dateString = req.query.date.toString();
        date.setFullYear(parseInt(dateString.split('-')[0]));
        date.setMonth(parseInt(dateString.split('-')[1]) - 1);
    }
    res.render("calendar", { calendar: (0, calendar_1.getCalendar)(date, req.params.filename) });
};
exports.calendarView = calendarView;
const loginView = (req, res) => {
    res.render("login", { error: false });
};
exports.loginView = loginView;
const loginForm = (req, res) => {
    if (req.body.password == undefined) {
        res.render("login", { error: true, errorMessage: "Wrong password" });
        return;
    }
    if (process.env.PASSWORD_HASH == undefined || process.env.PASSWORD_HASH == "") {
        res.render("login", { error: true, errorMessage: "Please add a PASSWORD_HASH in your .env" });
        return;
    }
    bcrypt_1.default.compare(req.body.password, process.env.PASSWORD_HASH, (err, result) => {
        if (err)
            throw err;
        if (result) {
            req.session.authenticated = true;
            res.redirect("/dashboard");
        }
        else
            res.render("login", { error: true, errorMessage: "Wrong password" });
    });
};
exports.loginForm = loginForm;
const stateSet = (req, res) => {
    (0, set_state_1.setState)(req.params.filename, req.params.dateString, req.params.state).then(() => {
        res.send();
    });
};
exports.stateSet = stateSet;
const checkAuthenticated = (req, res, next) => {
    if (req.session.authenticated == undefined || req.session.authenticated == false) {
        res.redirect('/login');
    }
    else
        next();
};
exports.checkAuthenticated = checkAuthenticated;
