'use strict';

require('../lib/envVars').config();
const witAi = require('./wit-ai.js');
const messageQueue = require('../lib/messageQueue.js');

module.exports.handler = (event, context, cb) => {
  if (!process.env.WIT_AI_TOKEN) {
    return cb('No WIT_AI_TOKEN defined');
  }
  if (event.Records && event.Records[0] && event.Records[0].Sns) {
    return messageQueue.getMessage(event)
      .then((message) => {
        return witAi(message);
      })
      .then((message) => {
        const topicName = [
          process.env.SERVERLESS_PROJECT,
          'fbMessengerTopic',
          process.env.SERVERLESS_STAGE
        ].join('-');
        return messageQueue.sendMessage(topicName, { message });
      })
      .then(result => cb(null, result))
      .catch(error => cb(error));
  }
  return cb('No SNS event');
};
