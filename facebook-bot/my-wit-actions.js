const moment = require('moment');
const weather = require('./weather');

const actions = {
  getWeather: data => new Promise((resolve, reject) => {
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

module.exports = actions;