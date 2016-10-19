'use strict';

require('dotenv').config();
const witAi = require('./wit-ai.js');

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
      const snsEvent = JSON.parse(event.Records[0].Sns.Message);
      witAi(snsEvent)
      .then(result => {
        cb(null, result);
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
