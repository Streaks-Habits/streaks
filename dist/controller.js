"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthenticated = exports.stateSet = exports.loginForm = exports.loginView = exports.calendarView = exports.dashboardView = exports.servePublic = exports.serveStyles = exports.index = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const calendar_1 = require("./scripts/calendar");
const set_state_1 = require("./scripts/set_state");
var jwtExpirySeconds = 1814400; // three weeks
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
    (0, calendar_1.getCalendarList)().then((calendarList) => {
        res.render("dashboard", { calendars: calendarList, dateStr: dateStr });
    }).catch((err) => {
        res.status(500);
        res.send(err);
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
    (0, calendar_1.getCalendar)(date, req.params.filename).then((calendar) => {
        res.render("calendar", { calendar });
    }).catch((err) => {
        res.status(500);
        res.send(err);
    });
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
    if (process.env.PASSWORD_HASH == undefined || process.env.PASSWORD_HASH == "")
        throw "Please add a PASSWORD_HASH in your .env";
    if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "")
        throw "Please add a JWT_KEY in your .env";
    bcrypt_1.default.compare(req.body.password, process.env.PASSWORD_HASH, (err, result) => {
        if (err)
            throw err;
        if (result) {
            jsonwebtoken_1.default.sign({ authenticated: true }, process.env.JWT_KEY, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            }, (err, token) => {
                if (err)
                    throw err;
                res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
                res.redirect("/dashboard");
            });
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
    const token = req.cookies.token;
    if (!token)
        res.redirect('/login');
    else {
        if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "")
            throw "Please add a JWT_KEY in your .env";
        jsonwebtoken_1.default.verify(token, process.env.JWT_KEY, {}, (err, decoded) => {
            if (err)
                res.redirect('/login');
            else {
                jsonwebtoken_1.default.sign({ authenticated: true }, process.env.JWT_KEY, {
                    algorithm: "HS256",
                    expiresIn: jwtExpirySeconds,
                }, (err, token) => {
                    if (err)
                        throw err;
                    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
                    next();
                });
            }
        });
    }
};
exports.checkAuthenticated = checkAuthenticated;
