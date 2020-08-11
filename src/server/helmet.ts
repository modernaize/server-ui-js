import fs from "fs";
import xssFilter from "x-xss-protection";
import dnsPrefetchControl from "dns-prefetch-control";
import frameguard from "frameguard";
import ieNoOpen from "ienoopen";
import noSniff from "dont-sniff-mimetype";
import path from "path";
import { Application } from "express";
const hsts = require("hsts");

interface HelmSettings {
  xssFilter: {
    setOnOldIE: true;
  };
  hsts: {
    maxAge: 5184000;
  };
}

const helmetFilePath = path.join(__dirname, ".", "helmet", "settings.json");
const _helmetoptions = fs.readFileSync(helmetFilePath, "utf8");
const helmetoptions: HelmSettings = JSON.parse(_helmetoptions);

/**
 * helmet plugin configuration
 */
const enableHelmet = (app: Application) => {
  app.disable("x-powered-by");
  app.use(xssFilter(helmetoptions.xssFilter));
  app.use(dnsPrefetchControl());
  app.use(frameguard());
  app.use(hsts(helmetoptions.hsts));
  app.use(ieNoOpen());
  app.use(noSniff());
};

module.exports.enableHelmet = enableHelmet;
