'use strict';

const Wit = require('node-wit').Wit;
const myActions = require('./my-wit-actions');
const session = require('../lib/session.js');
const AWS = require('aws-sdk');

// Initialize AWS and DynamoDB (for session access)
if (typeof AWS.config.region !== 'string') {
  console.log('No region found, defaulting to us-east-1');
  AWS.config.update({ region: 'us-east-1' });
}

const lambda = new AWS.Lambda();

/**
 * Handles wit.ai integration
 * @param event
 */
const init = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message) {
    const recipient = { id: event.sender.id };
    const sessionId = `${event.id}-${event.updated}`;
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
    if (event.message.text) {
      client.runActions(sessionId, event.message.text, Object.assign({}, event.context))
        .then(ctx => session.writeSession({ id: event.id, updated: event.updated, context: ctx }))
        .catch(error => rejectMessage(error));
    } else if (event.message.attachments && event.message.attachments[0].type === 'audio') {

      const payload = {
        url: event.message.attachments[0].payload.url,
        wit: process.env.WIT_AI_TOKEN
      };

      const params = {
        FunctionName: process.env.SPEECH_FUNCTION,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(payload)
      };

      if (process.env.SPEECH_FUNCTION) {
        // function to invoke https://github.com/laardee/wit-ai-speech
        lambda.invoke(params, (err, data) => {
          if (err) {
            rejectMessage(err);
          }
          const invokePayload = JSON.parse(data.Payload);
          const context = {};
          const entities = invokePayload.entities;
          for (const key in entities) {
            if (entities.hasOwnProperty(key)) {
              context[key] = entities[key][0].value;
            }
          }

          // This could be improved
          client.runActions(sessionId, invokePayload._text, Object.assign({}, event.context, context))
            .then(ctx => session.writeSession({ id: event.id, updated: event.updated, context: ctx }))
            .catch(error => rejectMessage(error));
        });
      } else {
        rejectMessage('I can\'t understand you, because speech function is undefined');
      }
    } else {
      rejectMessage('Unknown message type');
    }
  } else {
    rejectMessage(`Missing sender / message in ${JSON.stringify(event, null, 2)}`);
  }
});

module.exports = init;
