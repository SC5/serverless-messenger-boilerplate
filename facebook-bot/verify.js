'use strict';

const Promise = require('bluebird');
const dotenv = require('dotenv');

dotenv.config();

function verify(verifyToken, challenge) {
  console.log('Verifying token', verifyToken, 'challenge', challenge);
  console.log(process.env);
  if (verifyToken === process.env.FACEBOOK_BOT_VERIFY_TOKEN) {
    return Promise.resolve({ response: challenge });
  }
  return Promise.reject(new Error('400 Bad Token'));
}

module.exports.handler = (event, context, cb) =>
  verify(event.query['hub.verify_token'], event.query['hub.challenge'])
    .then(response => cb(null, response))
    .then(null, err => cb(err));
