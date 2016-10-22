'use strict';

require('dotenv').config();
const witAi = require('./wit-ai.js');
const messageQueue = require('../lib/messageQueue.js');

/**
 * Adds extra environmental variables
 * @param event
 */
function setEnvVars(event) {
  process.env.SERVERLESS_STAGE = event.stage;
}

module.exports.handler = (event, context, cb) => {
  if (process.env.WIT_AI_TOKEN) {
    if (event.Records && event.Records[0] && event.Records[0].Sns) {
      messageQueue.getMessage(event)
      .then((message) => {
        setEnvVars(message);
        witAi(message)
        .then(result => {
          let newMessage = { 
            recipient:{ id: message.sender.id },
            message: result
          }
          const topicName = [
            process.env.SERVERLESS_PROJECT, 
            'fbMessengerTopic', 
            process.env.SERVERLESS_STAGE
          ].join('-');

          messageQueue.sendMessage(topicName, {
            message: newMessage
          })
          .then(result2 => {
            cb(null, result2);
          })
          .catch(error => {
            cb(error);
          });
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
