var verify = require('./verify.js');
var bot = require('./bot.js');

module.exports.handler = function(event, context, callback) {
    console.log(event);
    if (event.method == 'GET') {
        verify.handler(event,context, callback);
    } else {
        bot.handler(event, context, callback);
    }
}