'use strict';

require('dotenv').config();
const messenger = require('./fb-messenger.js');

/**
 * Adds extra environmental variables
 * @param event
 */
function setEnvVars(event) {
  process.env.SERVERLESS_STAGE = event.stage;
}

module.exports.handler = (event, context, cb) => {
  setEnvVars(event);
  if (event.method === 'GET') {
    messenger.verify(event, cb);
  } else if (event.method === 'POST') {
    messenger.handler(event, cb);
  } else if (event.Records && event.Records[0] && event.Records[0].Sns) {
    const snsEvent = JSON.parse(event.Records[0].Sns.Message);
    messenger.sendMessage(snsEvent.recipient.id, snsEvent.message)
    .then(result => {
      cb(null, result);
    })
    .catch(error => {
      cb(error);
    });
  } else {
    cb('Uknown event');
  }
};
