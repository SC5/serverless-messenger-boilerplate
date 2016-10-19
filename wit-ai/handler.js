'use strict';

require('dotenv').config();
const witAi = require('./wit-ai.js');
const messageQueue = require('../lib/messagequeue.js');

/**
 * Adds extra environmental variables
 * @param event
 */
function setEnvVars(event) {
  process.env.SERVERLESS_STAGE = event.stage;
}

module.exports.handler = (event, context, cb) => {
  setEnvVars(event);
  if (process.env.WIT_AI_TOKEN) {
    if (event.Records && event.Records[0] && event.Records[0].Sns) {
      messageQueue.getMessage(event)
      .then((message) => {
        witAi(message)
        .then(result => {
          cb(null, result);
        })
        .catch(error => {
          cb(error);
        });
      })
      .catch(error => {
        cb(error);
      });
    } else {
      cb('No SNS event');
    }
  } else {
    cb('No WIT_AI_TOKEN defined')
  }
}
