const moment = require('moment');

const actions = {
  getTime: data => new Promise((resolve) => {
    // Sample action for node-wit
    const contextData = {};
    Object.assign(contextData, { datetime: moment().calendar().toLowerCase() });
    resolve(contextData);
  })
};

module.exports = actions;
