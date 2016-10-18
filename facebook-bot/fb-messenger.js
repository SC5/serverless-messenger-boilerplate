'use strict';

const request = require('request-promise');
const session = require('./session.js');
const witAi = require('../wit-ai/wit-ai.js');

function sendGenericMessage(recipientId) {
  const messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{
          title: 'Hi I\'m a bot on serverless 1.0! Do you like me?',
          buttons: [{
            type: 'postback',
            title: 'Yes',
            payload: 'like'
          }, {
            type: 'postback',
            title: 'No',
            payload: 'dislike'
          }]
        }]
      }
    }
  };

  return request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FACEBOOK_BOT_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: recipientId },
      message: messageData,
    }
  });
}

/**
 * Sends text message to recipient
 * @param recipientId
 * @param result
 */
function sendTextMessage(recipientId, result) {
  const message = { text: result.text };

  if (result.quickreplies) {
    Object.assign(message, {
      quick_replies: result.quickreplies.map(x => ({ title: x, content_type: 'text', payload: 'empty' }))
    });
  }

  return request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FACEBOOK_BOT_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: recipientId },
      message
    }
  });
}

/**
 * Handles postback message
 * @param event
 */
function receivePostback(event) {
  if (event.postback.payload === 'like') {
    return sendTextMessage(event.sender.id, '^_^ I\'m very happy to hear that!');
  }
  return sendTextMessage(event.sender.id, 'Too bad :-(');
}

/**
 * Handles opt in message
 * @param event
 * @returns {null}
 */
function receiveOptIn(event) {
  if (event.sender && event.sender.id) {
    console.log('Received opt-in from user', event.sender.id, 'with ref', event.optin.ref);
    return sendTextMessage(event.sender.id, {
      text: 'Hello! I\'m a bot. Ask me anything you like.'
    });
  }
  return null;
}

/**
 * Handles text message and passes it to wit.ai
 * @param event
 * @returns {Promise.<TResult>}
 */
function receiveMessage(event) {
  if (process.env.WIT_AI_TOKEN) {
    return witAi(event)
      .then(result => sendTextMessage(event.sender.id, result))
      .catch((error) => {
        if (error.message) {
          console.log('witAi error:', error.message);
          return sendTextMessage(event.sender.id, {
            text: `Error: ${error.message}`
          });
        }
        return null;
      });
  } else if (event.sender && event.sender.id && event.message && event.message.text) {
    return sendTextMessage(event.sender.id, {
      text: 'Hello! I should converse with Wit.ai but I do not have a key!'
    });
  }
  return null;
}

function receiveOtherEvent(event) {
  return new Promise((resolveMessage, rejectMessage) => {
    resolveMessage({
      type: 'unhandled',
      event
    });
  });
}

/**
 * Example generic message
 * @returns {null}
 */
function receiveMessageGeneric(event) {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    // Handle message
    // return sendTextMessage(event.sender.id, 'Hi! Why do you say ' + event.message.text + '?')
    return sendGenericMessage(event.sender.id);
  }
  return null;
}

/**
 * Message handler
 * @param entriesData
 * @returns {Promise.<TResult>}
 */
function receiveMessages(entriesData) {
  let promise = Promise.resolve();
  const entries = entriesData || [];
  entries.forEach((entry) => {
    const messaging = entry.messaging || [];
    messaging.forEach((event) => {
      const userId = event.sender.id;
      session.readSession(userId.toString())
        .then((sessionData) => {
          const eventData = Object.assign({}, event, sessionData);
          promise = promise.then(() => {
            if (eventData.postback) {
              return receivePostback(eventData);
            } else if (eventData.optin) {
              return receiveOptIn(eventData);
            } else if (eventData.message) {
              return receiveMessage(eventData);
            }
            return receiveOtherEvent(eventData);
          });
        });
    });
  });

  return promise
    .then(() => ({}))
    .then(null, (err) => {
      console.log('Error handling messages:', err);
      return {};
    });
}

function verify(verifyToken, challenge) {
  if (verifyToken === process.env.FACEBOOK_BOT_VERIFY_TOKEN) {
    return Promise.resolve({ response: challenge });
  }

  return Promise.reject(new Error('400 Bad Token'));
}

module.exports.verify = (event, cb) =>
  verify(event.query['hub.verify_token'], event.query['hub.challenge'])
    .then(response => cb(null, response))
    .then(null, err => cb(err));

module.exports.handler = (event, cb) =>
  receiveMessages(event.body.entry || [])
    .then(response => cb(null, response))
    .then(null, (err) => {
      console.log('Error:', err);
      cb(null, 'Error:', err);
    });
