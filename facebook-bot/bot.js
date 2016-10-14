'use strict';

const request = require('request-promise');
const session = require('./session.js');
const witAi = require('./wit-ai');

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
    return sendTextMessage(event.sender.id, 'Hello! I\'m a bot. Ask me anything you like.');
  }
  return null;
}

/**
 * Handles text message and passes it to wit.ai
 * @param event
 * @returns {Promise.<TResult>}
 */
function receiveMessage(event) {
  return witAi(event)
    .then(result => sendTextMessage(event.sender.id, result))
    .catch(error => console.error('wit send error', error.message));
}

/**
 * Example generic message
 * @returns {null}
 */
function receiveMessageGeneric() {
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
      session.writeSession({ id: userId.toString() })
        .then((sessionData) => {
          const eventData = Object.assign({}, event, sessionData);
          promise = promise.then(() => {
            if (eventData.postback) {
              return receivePostback(eventData);
            } else if (eventData.optin) {
              return receiveOptIn(eventData);
            }
            return receiveMessage(eventData);
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

module.exports.handler = (event, cb) =>
  receiveMessages(event.body.entry || [])
    .then(response => cb(null, response))
    .then(null, err => cb(err));

