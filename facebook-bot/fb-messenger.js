'use strict';

const request = require('request-promise');
const session = require('../lib/session.js');
const messageQueue = require('../lib/messageQueue.js');

/**
 * Sends generic message to recipient
 * @param recipientId
 */
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
    const topicName = [
      process.env.SERVERLESS_PROJECT,
      'witAiTopic',
      process.env.SERVERLESS_STAGE
    ].join('-');
    console.log('Forward:');
    console.log(event);
    return messageQueue.sendMessage(topicName, {
      message: event
    });
  } else if (event.sender && event.sender.id && event.message && event.message.text) {
    return sendTextMessage(event.sender.id, {
      text: 'Hello! I should converse with Wit.ai but I do not have a key!'
    });
  }
  return null;
}

/**
 * Handles other messages
 * @param event
 * @returns {Promise}
 */
function receiveOtherEvent(event) {
  return new Promise((resolve) => {
    resolve({
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
 * Interface for sending Messages
 * @returns {Promise.<TResult>}
 */
function sendMessage(recipientId, message) {
  // Currently supports only text messages
  return sendTextMessage(recipientId, message);
}

/**
 * Receive a single event
 * @param eventData
 * @returns {Promise.<TResult>}
 */
function receiveEvent(event) {
  return new Promise((success, failure) => {
    const userId = event.sender.id;
    session.readSession(userId.toString())
      .then((sessionData) => {
        const eventData = Object.assign({}, event, sessionData);
        if (eventData.postback) {
          receivePostback(eventData).then(success, failure);
        } else if (eventData.optin) {
          receiveOptIn(eventData).then(success, failure);
        } else if (eventData.message) {
          receiveMessage(eventData).then(success, failure);
        } else {
          receiveOtherEvent(eventData).then(success, failure);
        }
      })
      .catch((error) => {
        console.log('ERROR (receiveEvent):', error);
        failure(error);
      });
  });
}

/**
 * Message handler
 * @param entriesData
 * @returns {Promise.<TResult>}
 */
function receiveEvents(entriesData) {
  return new Promise((resolve, reject) => {
    const entries = entriesData || [];
    const events = [];
    entries.forEach((entry) => {
      const messaging = entry.messaging || [];
      messaging.forEach((event) => {
        events.push(receiveEvent(event));
      });
    });
    Promise.all(events)
    .then(responses => resolve(responses))
    .catch(error => reject(error));
  });
}

/**
 * Verifies bot to Facebook
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

module.exports = {
  sendMessage,
  verify: (event, cb) =>
    verify(event.query['hub.verify_token'], event.query['hub.challenge'])
      .then(response => cb(null, response))
      .catch(err => cb(err)),
  receive: (event, cb) =>
    receiveEvents(event.body.entry || [])
      .then(response => cb(null, response))
      .catch((err) => {
        console.log('Error:', err);
        return cb(null, 'Error:', err);
      })
};
