import fs from "fs";
import licenseFile from "nodejs-license-file";
const logger = require("./logger");

interface AppLicense {
  scenarios?: number;
  valid?: boolean;
  errorMessage?: string;
}

const appLicense: AppLicense = {};

/**
 * get license file from the license folder and check if the license os valid or not
 */
const getLicense = () => {
  const template = fs.readFileSync(
    "./license/template/1.1/lic.template",
    "utf8"
  );

  // eslint-disable-next-line radix
  try {
    const data = licenseFile.parse({
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
      } else {
        logger.info("valid license key");
        appLicense.scenarios = parseInt(data.data.scenarios);
        appLicense.valid = true;
        appLicense.errorMessage = "Valid License key";
      }
    } else {
      logger.error("invalid license key");
      appLicense.scenarios = parseInt(data.data.scenarios);
      appLicense.valid = false;
      appLicense.errorMessage =
        "Invalid License Key, please contact your Administrator";
    }
  } catch (err) {
    logger.error(err);
    appLicense.valid = false;
    appLicense.errorMessage =
      "License Key Not Found, please contact your Administrator";
  }
  return appLicense;
};

exports.getLicense = getLicense;
