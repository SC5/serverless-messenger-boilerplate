'use strict';

const Promise = require('bluebird');
const request = require('request-promise');

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

function sendTextMessage(recipientId, text) {
  return request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FACEBOOK_BOT_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: recipientId },
      message: { text }
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
  console.log('Processing event:', event);
  if (event.sender && event.sender.id && event.message && event.message.text) {
    // Handle message
    // return sendTextMessage(event.sender.id, 'Hi! Why do you say ' + event.message.text + '?')
    return sendGenericMessage(event.sender.id);
  }
  return null;
}

function receiveMessages(entries) {
  let promise = Promise.resolve();
  entries.map((entry) => {
    const messaging = entry.messaging || [];
    return messaging.map((event) => {
      promise = promise.then(() => {
        if (event.postback) {
          return receivePostback(event);
        } else if (event.optin) {
          return receiveOptIn(event);
        }
        return receiveMessage(event);
      });
      return promise;
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
  console.log(event.body);
  return receiveMessages(event.body.entry || [])
    .then(response => cb(null, response))
    .then(null, err => cb(err));
};
