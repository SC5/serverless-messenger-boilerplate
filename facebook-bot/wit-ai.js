'use strict';

const Wit = require('node-wit').Wit;
const request = require('request-promise');
const moment = require('moment');

const send = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = `${event.sender.id}-${moment().valueOf()}`; // NOTICE!!, session id must differ
    const context0 = {};
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: {
        send: (request, response) => new Promise((resolve, reject) => {
          console.log('send', JSON.stringify(response));
          resolveMessage(response);
        }),
        getWeather: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;
          const location = data.entities.location[0].value;
          const datetime = data.entities.datetime ? data.entities.datetime[0].value : null;

          weatherByLocationName(location)
            .then((weather) => {
              const w = `${weather.description} and ${kelvinToCelsius(weather.temperature)}°C`;
              Object.assign(context, { weather: w, location: weather.name });
              if (datetime) {
                Object.assign(context, { datetime: moment(datetime).calendar().toLowerCase() });
              }
              resolve(context);
            })
            .catch(reject);
        })
      }
    });
    client.runActions(sessionId, event.message.text, context0);
  } else {
    rejectMessage('wit ai failed');
  }
});

const kelvinToCelsius = (k) => Math.round(k - 273.15);

const weatherByLocationName = (locationName) => {
  const options = {
    uri: 'http://api.openweathermap.org/data/2.5/weather',
    qs: {
      q: locationName,
      APPID: process.env.WEATHER_API_TOKEN
    },
    json: true
  };

  return request(options)
    .then(data => ({
      temperature: data.main.temp,
      description: data.weather[0].description,
      name: data.name
    }));
};

const forecastByLocationName = (locationName, datetime) => {
  const options = {
    uri: 'http://api.openweathermap.org/data/2.5/forecast',
    qs: {
      q: locationName,
      APPID: process.env.WEATHER_API_TOKEN
    },
    json: true
  };

  return request(options)
    .then(data => ({
      temperature: data.main.temp,
      description: data.weather[0].description,
      name: data.name
    }));
}

module.exports = {
  send
};
