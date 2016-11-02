'use strict';

require('../lib/envVars').config();
const messenger = require('./fb-messenger.js');
const messageQueue = require('../lib/messageQueue.js');

module.exports.handler = (event, context, cb) => {
  if (event.method === 'GET') {
    return messenger.verify(event, cb);
  } else if (event.method === 'POST') {
    return messenger.receive(event, cb);
  } else if (event.Records && event.Records[0] && event.Records[0].Sns) {
    return messageQueue.getMessage(event)
      .then((queueEvent) => {
        const message = queueEvent.message;
        if (process.env.SILENT) {
          return queueEvent;
        }
        return messenger.sendMessage(queueEvent.recipient.id, message);
      })
      .then(result => cb(null, result))
      .catch((error) => {
        console.log('ERROR, handler', error);
        cb(error);
      });
  }
  return cb('Unknown event');
};
