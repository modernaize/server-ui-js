const fs = require('fs');
const xssFilter = require('x-xss-protection');
const dnsPrefetchControl = require('dns-prefetch-control');
const frameguard = require('frameguard');
const hsts = require('hsts');
const ieNoOpen = require('ienoopen');
const noSniff = require('dont-sniff-mimetype');
const path = require('path');

const helmetFilePath = path.join(__dirname, '.', 'helmet', 'settings.json');
const helmetoptions = fs.readFileSync(helmetFilePath, 'utf8');

/**
 * helmet plugin configuration
 */
const enableHelmet = (app) => {
  app.disable('x-powered-by');
  app.use(xssFilter(helmetoptions.xssFilter));
  app.use(dnsPrefetchControl());
  app.use(frameguard());
  app.use(hsts(helmetoptions.hsts));
  app.use(ieNoOpen());
  app.use(noSniff());
};

module.exports.enableHelmet = enableHelmet;
