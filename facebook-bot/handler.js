'use strict';

require('dotenv').config();
const messenger = require('./fb-messenger.js');
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
  if (event.method === 'GET') {
    messenger.verify(event, cb);
  } else if (event.method === 'POST') {
    messenger.receive(event, cb);
  } else if (event.Records && event.Records[0] && event.Records[0].Sns) {
    messageQueue.getMessage(event)
    .then((event) => {
      const message = event.message;
      setEnvVars(event);
      if (process.env.SILENT) {
        return cb(null, event);
      }
      messenger.sendMessage(event.recipient.id, message)
      .then(result => {
        console.log()
        cb(null, result);
      })
      .catch(error => {
        cb(error);
      });
    })
    .catch(error => {
      cb(error);
    })
  } else {
    cb('Uknown event');
  }
};
