'use strict';

const request = require('request-promise');
const moment = require('moment');

const defaultWeatherData = {
  temperature: 'unknown',
  description: 'unknown',
  location: 'unknown'
};

/**
 * Converts Kelvins to Celsius
 * @param k
 */
const kelvinToCelsius = k => Math.round(k - 273.15);

/**
 * Maps weather data
 * @param data
 */
const mapWeatherData = (data) => {
  const description = data.weather ? data.weather[0].description : defaultWeatherData.description;
  const temperature = data.main && data.main.temp ? kelvinToCelsius(data.main.temp) : defaultWeatherData.temperature;
  return {
    temperature,
    description,
    location: data.name
  };
};

/**
 * Gets current weather for location
 * @param locationName
 * @returns {*}
 */
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

/**
 * Gets forecast for location
 * @param locationName
 * @param datetime
 * @returns {*}
 */
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
      const weatherData = forecastsInDatetime.length > 0 ? forecastsInDatetime[0] : {};
      return mapWeatherData(Object.assign({}, weatherData, city));
    });
};

module.exports = {
  forecastByLocationName,
  weatherByLocationName
};