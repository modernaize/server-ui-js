const req = require('express').request;
const res = require('express').response;
const request = require('request');
const routes = require('express').Router();
const bodyParser = require('body-parser');

const express = require('express');
const fs = require('fs');
const path = require('path');

const UI_PROTOCOL = process.env.UI_PROTOCOL || process.env.PROTOCOL || 'http';
const SERVICE_PROTOCOL = process.env.SERVICE_PROTOCOL || process.env.PROTOCOL || 'http';
const LEARN_PROTOCOL = process.env.LEARN_PROTOCOL || process.env.PROTOCOL || 'http';
const AUTOJOIN_PROTOCOL = process.env.AUTOJOIN_PROTOCOL || process.env.PROTOCOL || 'http';
const LICENSE_PROTOCOL = process.env.LICENSE_PROTOCOL || process.env.PROTOCOL || 'http';

const serviceHost = process.env.SERVICE_HOST;
const servicePort = process.env.SERVICE_PORT || 8000;
const serviceURL = `${SERVICE_PROTOCOL}://${serviceHost}:${servicePort}`;

const learnHost = process.env.LEARN_HOST;
const learnPort = process.env.LEARN_PORT || 5000;
const learnURL = `${LEARN_PROTOCOL}://${learnHost}:${learnPort}`;

const uiHost = process.env.UI_HOST;
const uiPort = process.env.UI_PORT || 3000;
const uiURL = `${UI_PROTOCOL}://${uiHost}:${uiPort}`;

const licenseHost = process.env.LICENSE_HOST;
const licensePort = process.env.LICENSE_PORT || 3001;
const licenseURL = `${LICENSE_PROTOCOL}://${licenseHost}:${licensePort}`;

const autojoinHost = process.env.AUTOJOIN_HOST;
const autojoinPort = process.env.AUTOJOIN_PORT || 5002;
const autojoinURL = `${AUTOJOIN_PROTOCOL}://${autojoinHost}:${autojoinPort}`;

const httpProxy = require('http-proxy');

const apiProxy = httpProxy.createProxyServer();
const logger = require('./logger');
const axios = require('axios');

const serverStartTime = new Date();

/**
 * Liveness check
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function getLiveCheck(req, res) {
  logger.info('Execute liveness check');
  return res.status(200).end();
}

/**
 * readiness check
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function getReadyCheck(req, res) {
  logger.info('Execute readiness check');
  let response;

  response = { message: 'System is ready' };
  return res.status(200).json(response).end();

  // response = {message: 'System is not ready yet'};
  // return res.status(500).json(response).end();
}

/**
 * getpublic function
 * @param {object} req contains the request
 * @param {object} res contains the response
 */

function getPublic(req, res) {
  logger.debug('Executing getPublic');
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
    const applicationVersion = JSON.parse(packageJson).version || 0;

    // The file build.info is created and populated during build time in GitHub
    const buildInfoPath = path.join(process.cwd(), 'build.info');

    const buildInfo = fs.readFileSync(buildInfoPath, 'utf8');

    const branch = JSON.parse(buildInfo).branch || 0;
    const commitId = JSON.parse(buildInfo).commit || 0;
    const buildDate = JSON.parse(buildInfo).buildDate || 0;
    const buildId = JSON.parse(buildInfo).buildId || 0;
    const commitLogId = JSON.parse(buildInfo).commitLogId || 0;

    res.send({
      commitLogId,
      containerType: 'UI',
      applicationVersion,
      bootTime: serverStartTime,
      branch,
      buildId,
      commitId,
      buildDate,
    });
  } catch (err) {
    logger.error(err);
    res.send(err);
  }
}

/**
 * use for making the connection with the allAPI backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allApi(req, res) {
  logger.debug('Executing allApi');
  // apiProxy.web(req, res, { target: serviceURL });
  authenticateAndForward(req, res, serviceURL);
}

/**
 * use for making the connection with the allUnslearn backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allUnslearn(req, res) {
  logger.debug('Executing allUnslearn');
  authenticateAndForward(req, res, learnURL);
}

/**
 * Used for making the connection with the allAutojoinService backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allAutojoinService(req, res) {
  logger.debug('Executing allAutojoinService');
  authenticateAndForward(req, res, autojoinURL);
}

/**
 * use for making the connection with the allDatamap backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allDatamap(req, res) {
  logger.debug('Executing allDatamap');
  authenticateAndForward(req, res, learnURL);
}

/**
 * use for making the connection with the allMatching backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allMatching(req, res) {
  logger.debug('Executing allMatching');
  authenticateAndForward(req, res, learnURL);
}

/**
 * use for making the connection with the allRule backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allRule(req, res) {
  logger.debug('Executing allRule');
  authenticateAndForward(req, res, learnURL);
}

/**
 * use for making the connection with the allKpi backend route
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function allKpi(req, res) {
  authenticateAndForward(req, res, learnURL);
}

/**
 * use for getting the license file
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function getUserInfo(req, res) {
  logger.debug('Executing getUserInfo');
  apiProxy.web(req, res, { target: licenseURL });
}

/**
 * upload license file function
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function postLicUpload(req, res) {
  logger.debug('Executing postLicUpload');
  apiProxy.web(req, res, { target: licenseURL });
}

/**
 * get the list of license file
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function getLicFileList(req, res) {
  logger.debug('Executing getLicFileList');
  apiProxy.web(req, res, { target: licenseURL });
}

/**
 * rename the license file
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function renameLicFile(req, res) {
  logger.debug('Executing renameLicFile');
  apiProxy.web(req, res, { target: licenseURL });
}

/**
 * getAsterix function
 * @param {object} req contains the request
 * @param {object} res contains the response
 */

function getAsterix(req, res) {
  res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
}

/**
 * postLogs in winston
 * @param {object} req contains the request
 * @param {object} res contains the response
 */
function postLogs(req, res) {
  const { type, message } = req.body;
  if (type === 'error') {
    logger.error(message);
  } else {
    logger.info(message);
  }
  res.send({ status: 200, message: 'success' });
}

routes.use('/live', getLiveCheck);
routes.use('/ready', getReadyCheck);

routes.get('*.js', (req, res, next) => {
  logger.debug('Executing routes.get');
  req.url += '.gz';
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});
cachesc c
routes.all('/kpi/*', allKpi);

routes.all('/api/*', allApi);

routes.get('/lic/userInfo', getUserInfo);

routes.post('/lic/upload', postLicUpload);

routes.get('/lic/fileList', getLicFileList);

routes.get('/public', getPublic);

routes.all('/rule/*', allRule);

routes.all('/matching/*', allMatching);

routes.all('/unslearn/*', allUnslearn);

routes.all('/autojoin/*', allAutojoinService);

routes.all('/datamap/*', allDatamap);

routes.post('/lic/rename', renameLicFile);

routes.use(bodyParser.json());

routes.post('/logs', postLogs);

routes.use('/', express.static(path.resolve(process.cwd(), 'dist')));

routes.get('*', getAsterix);

/**
 * authenticateAndForward function
 * @param {object} req contains the request
 * @param {object} res contains the response
 * @param {number} proxyHost  port number
 */
async function authenticateAndForward(req, res, proxyHost) {
  logger.debug(`Executing authenticateAndForward ${proxyHost}`);
  const uri = `${serviceURL}/api/security/me`;

  const requestOptions = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'my request',
      Authorization: req.headers.authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  function callBack(error, response) {
    if (!error && response.statusCode === 200) {
      apiProxy.web(req, res, { target: proxyHost });
    }
    apiProxy.on('error', (e) => {
      logger.error(`not able to connect ${proxyHost}, hostname: ${e.hostname}, Code: ${e.code}, errno: ${e.errno}`);
    });
  }
  request(requestOptions, callBack);
}

module.exports = routes;
