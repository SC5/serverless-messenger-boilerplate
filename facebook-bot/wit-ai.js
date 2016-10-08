'use strict';

const nodeWit = require('node-wit');

const Wit = nodeWit.Wit;

const send = event => new Promise((resolveMessage, reject) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = event.sender.id;
    const context0 = {};
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: {
        send: (request, response) => new Promise((resolve, reject) => {
          console.log('send', JSON.stringify(response));
          resolveMessage(response);
        }),
        getTime: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;
          console.log(con)
          delete context.missingLocation;
          Object.assign(context, { time: new Date() });
          resolve(context);
        }),
        getNumber: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;
          Object.assign(context, { number: Math.floor(Math.random() * 6) + 1 });
          resolve(context);
        }),
        getFavoriteColor: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;
          Object.assign(context, { color: 'black' });
          resolve(context);
        })
      }
    });

    client.runActions(sessionId, event.message.text, context0)
      // .then((data) => {
      //   console.log(event.message.text);
      //   return resolve(JSON.stringify(data))
      // })
      // .catch(reject);
  } else {
    reject('wit ai failed');
  }
});

module.exports = {
  send
};
