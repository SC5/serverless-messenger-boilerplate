'use strict';

const Wit = require('node-wit').Wit;
const request = require('request-promise');

const send = event => new Promise((resolveMessage, rejectMessage) => {
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
        getWeather: (data) => new Promise((resolve, reject) => {
          const context = data.context;
          const entities = data.entities;
          //delete context.missingLocation;
          console.log(context, entities)
          const location = data.entities.location[0].value;
          console.log('location', location);
          weatherByLocationName(location)
            .then((weather) => {
              Object.assign(context, { weather: weather.description, location });
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
    }))
};

module.exports = {
  send
};
