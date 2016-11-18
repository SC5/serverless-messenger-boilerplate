'use strict';

const Wit = require('node-wit-legacy').Wit;
const myActions = require('./my-wit-actions');
const session = require('../lib/session.js');

/**
 * Handles wit.ai integration
 * @param event
 */
const init = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = `${event.id}-${event.updated}`;
    const recipient = { id: event.sender.id };

    const actions = {
      send: (request, response) => new Promise((resolve) => {
        resolveMessage({ message: response, recipient });
        resolve();
      }),
      debugContext: data => new Promise((resolve) => {
        const context = data.context;
        console.log('WIT.AI DEBUG:');
        console.log(JSON.stringify(data, null, 2));
        resolve(context);
      })
    };

    // Combine custom actions and actions
    const combinedActions = Object.assign({}, actions, myActions);
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: combinedActions
    });

    client.runActions(sessionId, event.message.text, Object.assign({}, event.context))
      .then(ctx => session.writeSession({ id: event.id, updated: event.updated, context: ctx }))
      .catch((error) => {
        console.log('wit.ai error', error);
        resolveMessage({
          message: {
            text: error
          },
          recipient
        });
      });
  } else {
    rejectMessage(`Missing sender / message in ${JSON.stringify(event, null, 2)}`);
  }
});

module.exports = init;
