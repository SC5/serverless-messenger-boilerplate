'use strict';

const request = require('request-promise');
const moment = require('moment');

const kelvinToCelsius = k => Math.round(k - 273.15);

const mapWeatherData = data => ({
  temperature: kelvinToCelsius(data.main.temp),
  description: data.weather[0].description,
  name: data.name
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
    .then(mapWeatherData);
};

const forecastByLocationName = (locationName, datetime) => {
  const time = moment(datetime);
  const timestampInSecondsStart = time.valueOf() / 1000;
  const timestampInSecondsEnd = time.add(3, 'hours').valueOf() / 1000;
  const options = {
    uri: 'http://api.openweathermap.org/data/2.5/forecast',
    qs: {
      q: locationName,
      APPID: process.env.WEATHER_API_TOKEN
    },
    json: true
  };

  return request(options)
    .then((data) => {
      const city = data.city;
      const forecastsInDatetime = data.list.slice().filter(object =>
        (object.dt > timestampInSecondsStart && object.dt < timestampInSecondsEnd)
      );
      const weatherData = forecastsInDatetime.length > 0 ? forecastsInDatetime[0] : null;
      return mapWeatherData(Object.assign({}, weatherData, city));
    });
};

module.exports = {
  forecastByLocationName,
  weatherByLocationName
};