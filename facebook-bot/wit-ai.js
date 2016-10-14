'use strict';

const Wit = require('node-wit').Wit;
const moment = require('moment');
const weather = require('./weather');

/**
 * Handles wit.ai integration
 * @param event
 */
const init = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = `${event.id}-${event.updated}`;
    const context0 = {};
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: {
        send: (request, response) => new Promise(() => {
          resolveMessage(response);
        }),
        getWeather: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;

          const missingLocation = entities.location === undefined;
          const location = entities.location ? entities.location[0].value : null;
          const datetime = entities.datetime ? entities.datetime[0].value : null;

          if (missingLocation) {
            const contextData = Object.assign({}, context, { missingLocation });
            resolve(contextData);
          } else if (datetime) {
            weather.forecastByLocationName(location, datetime)
              .then((weatherData) => {
                const contextData = Object.assign({}, context, weatherData);
                if (datetime) {
                  Object.assign(contextData, { datetime: moment(datetime).calendar().toLowerCase() });
                }
                resolve(contextData);
              })
              .catch(reject);
          } else {
            weather.weatherByLocationName(location)
              .then((weatherData) => {
                const contextData = Object.assign({}, context, weatherData);
                if (datetime) {
                  Object.assign(contextData, { datetime: moment(datetime).calendar().toLowerCase() });
                }
                resolve(contextData);
              })
              .catch(reject);
          }
        })
      }
    });
    client.runActions(sessionId, event.message.text, context0);
  } else {
    rejectMessage('wit ai failed');
  }
});

module.exports = init;
