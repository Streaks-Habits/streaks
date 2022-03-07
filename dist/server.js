"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const routes_1 = __importDefault(require("./routes"));
const daemons_1 = require("./scripts/daemons");
dotenv_1.default.config();
node_schedule_1.default.scheduleJob('50 * * * *', daemons_1.runDaemons);
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.set('views', path_1.default.join('src', 'views'));
app.set('view engine', 'ejs');
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: "keyboard dog",
    resave: true,
    saveUninitialized: true
}));
app.use('/', routes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`\ncestmaddy started on ::${process.env.PORT}`);
});
