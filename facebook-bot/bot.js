'use strict';

const Promise = require('bluebird');
const request = require('request-promise');
const dotenv = require('dotenv').config();
const session = require('./session.js');
const wit = require('./wit-ai');

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

function receivePostback(event) {
  if (event.postback.payload === 'like') {
    return sendTextMessage(event.sender.id, '^_^ I\'m very happy to hear that!');
  }
  return sendTextMessage(event.sender.id, 'Too bad :-(');
}

function receiveOptIn(event) {
  if (event.sender && event.sender.id) {
    console.log('Received opt-in from user', event.sender.id, 'with ref', event.optin.ref);
    return sendTextMessage(event.sender.id, 'Hello! I\'m a bot. Ask me anything you like.');
  }
  return null;
}

function receiveMessage(event) {
  // if (event.sender && event.sender.id && event.message && event.message.text) {
  //   // Handle message
  //   // return sendTextMessage(event.sender.id, 'Hi! Why do you say ' + event.message.text + '?')
  //   return sendGenericMessage(event.sender.id);
  // }
  // return null;
  return wit.send(event)
    .then(result => sendTextMessage(event.sender.id, result))
    .catch(error => console.error('wit send error', error.message));
}

function receiveMessages(entriesData) {
  let promise = Promise.resolve();
  const entries = entriesData || [];
  entries.forEach((entry) => {
    const messaging = entry.messaging || [];
    messaging.forEach((event) => {
      const userId = event.sender.id;
      session.writeSession({ id: userId.toString() })
        .then((sessionData) => {
          // console.log('userId', userId);
          // console.log('Read session');
          // console.log(session);
          // console.log('sessionData', sessionData);
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

module.exports.handler = (event, cb) => {
  return receiveMessages(event.body.entry || [])
    .then(response => cb(null, response))
    .then(null, err => cb(err));
};
