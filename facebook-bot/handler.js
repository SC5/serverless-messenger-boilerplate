'use strict';

require('dotenv').config();
const messenger = require('./fb-messenger.js');

/**
 * Adds extra environmental variables
 * @param event
 */
function setEnvVars(event) {
  process.env.SERVERLESS_STAGE = event.stage;
  process.env.SERVERLESS_PROJECT = 'sc5-serverless-messenger-bot';
}

module.exports.handler = (event, context, cb) => {
  setEnvVars(event);
  if (event.method === 'GET') {
    messenger.verify(event, cb);
  } else {
    messenger.handler(event, cb);
  }
};
