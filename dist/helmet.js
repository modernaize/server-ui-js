"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const x_xss_protection_1 = __importDefault(require("x-xss-protection"));
const dns_prefetch_control_1 = __importDefault(require("dns-prefetch-control"));
const frameguard_1 = __importDefault(require("frameguard"));
const ienoopen_1 = __importDefault(require("ienoopen"));
const dont_sniff_mimetype_1 = __importDefault(require("dont-sniff-mimetype"));
const path_1 = __importDefault(require("path"));
const hsts = require("hsts");
const helmetFilePath = path_1.default.join(__dirname, ".", "helmet", "settings.json");
const _helmetoptions = fs_1.default.readFileSync(helmetFilePath, "utf8");
const helmetoptions = JSON.parse(_helmetoptions);
/**
 * helmet plugin configuration
 */
const enableHelmet = (app) => {
    app.disable("x-powered-by");
    app.use(x_xss_protection_1.default(helmetoptions.xssFilter));
    app.use(dns_prefetch_control_1.default());
    app.use(frameguard_1.default());
    app.use(hsts(helmetoptions.hsts));
    app.use(ienoopen_1.default());
    app.use(dont_sniff_mimetype_1.default());
};
module.exports.enableHelmet = enableHelmet;
//# sourceMappingURL=helmet.js.map