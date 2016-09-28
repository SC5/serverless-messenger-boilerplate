'use strict'

const Promise = require('bluebird');
const dotenv = require('dotenv').config();

module.exports.handler = function(event, context) {
  return verify(event.query['hub.verify_token'], event.query['hub.challenge'])
  .then(function (response) {
    return context.succeed(response)
  })
  .then(null, function (err) {
    return context.fail(err)
  })
}



function verify(verifyToken, challenge) {
  console.log('Verifying token', verifyToken, 'challenge', challenge);
  console.log(process.env);
  if (verifyToken == process.env.FACEBOOK_BOT_VERIFY_TOKEN) {
    return Promise.resolve({response:challenge})
  } else {
    return Promise.reject(new Error('400 Bad Token'))
  }
}
