'use strict';

const verify = require('./verify.js');
const bot = require('./bot.js');

module.exports.handler = (event, context, cb) => {
  console.log(event);
  setEnvVars(event);
  if (event.method === 'GET') {
    verify.handler(event, cb);
  } else {
    bot.handler(event, cb);
  }
};

function setEnvVars(event) {
  process.env.SERVERLESS_STAGE = event.stage;
  process.env.SERVERLESS_PROJECT = 'sc5-serverless-messenger-bot';
}
