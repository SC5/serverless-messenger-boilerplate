'use strict';

const Wit = require('node-wit').Wit;
const myActions = require('./my-wit-actions');

/**
 * Handles wit.ai integration
 * @param event
 */
const init = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = `${event.id}-${event.updated}`;
    const context0 = {};
    const actions = {
      send: (request, response) => new Promise(() => {
        resolveMessage(response);
      })
    };
    // Copy custom actions to actions
    Object.keys(myActions).map((value) => {
      actions[value] = myActions[value];
    });
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: actions
    });
    client.runActions(sessionId, event.message.text, context0)
    .then(result => resolveMessage(result))
    .catch(error => rejectMessage(error));
  } else {
    rejectMessage('wit ai failed');
  }
});

module.exports = init;
