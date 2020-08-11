"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const nodejs_license_file_1 = __importDefault(require("nodejs-license-file"));
const logger = require("./logger");
const appLicense = {};
/**
 * get license file from the license folder and check if the license os valid or not
 */
const getLicense = () => {
    const template = fs_1.default.readFileSync("./license/template/1.1/lic.template", "utf8");
    // eslint-disable-next-line radix
    try {
        const data = nodejs_license_file_1.default.parse({
            publicKeyPath: "./keys/license/public_key.pem",
            licenseFilePath: "./license/lo/file.lic",
            template,
        });
        const licenseEndDate = new Date(data.data.expirationDate);
        const currentDate = new Date();
        if (data.valid) {
            if (currentDate > licenseEndDate) {
                logger.info("expired");
                appLicense.scenarios = parseInt(data.data.scenarios);
                appLicense.valid = false;
                appLicense.errorMessage = "License key expired";
            }
            else {
                logger.info("valid license key");
                appLicense.scenarios = parseInt(data.data.scenarios);
                appLicense.valid = true;
                appLicense.errorMessage = "Valid License key";
            }
        }
        else {
            logger.error("invalid license key");
            appLicense.scenarios = parseInt(data.data.scenarios);
            appLicense.valid = false;
            appLicense.errorMessage =
                "Invalid License Key, please contact your Administrator";
        }
    }
    catch (err) {
        logger.error(err);
        appLicense.valid = false;
        appLicense.errorMessage =
            "License Key Not Found, please contact your Administrator";
    }
    return appLicense;
};
exports.getLicense = getLicense;
//# sourceMappingURL=license.js.map