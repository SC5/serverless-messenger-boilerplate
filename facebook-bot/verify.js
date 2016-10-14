'use strict';

/**
 * Verifies token when registering Facebook app
 * @param verifyToken
 * @param challenge
 * @returns {*}
 */
function verify(verifyToken, challenge) {
  if (verifyToken === process.env.FACEBOOK_BOT_VERIFY_TOKEN) {
    return Promise.resolve({ response: challenge });
  }

  return Promise.reject(new Error('400 Bad Token'));
}

module.exports.handler = (event, cb) =>
  verify(event.query['hub.verify_token'], event.query['hub.challenge'])
    .then(response => cb(null, response))
    .then(null, err => cb(err));
