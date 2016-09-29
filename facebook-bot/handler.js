'use strict';

const verify = require('./verify.js');
const bot = require('./bot.js');

module.exports.handler = (event, context, cb) => {
  console.log(event);
  if (event.method === 'GET') {
    verify.handler(event, context, cb);
  } else {
    bot.handler(event, context, cb);
  }
};
