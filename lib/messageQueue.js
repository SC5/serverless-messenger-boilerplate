/**
* Library / module for sending notifications usins Amazon SNS
*/

var AWS = require('aws-sdk');

// Initialize AWS and DynamoDB (for session access)
if (typeof AWS.config.region !== 'string') {
    console.log('No region found, defaulting to eu-west-1');
    AWS.config.update({ region: 'eu-west-1' });
}

var sns = new AWS.SNS();
var arnCache = {};

function getTopicArn(topicName) {
  return new Promise((success, failure) => {  
    sns.listTopics('', function(err, data) {
      var arnRe = new RegExp('arn:.+:' + topicName);
      var match;

      for (var i in data.Topics) {
        var topic = data.Topics[i];

        match = topic.TopicArn.match(arnRe);

        if (match != null) {
          return success(topic.TopicArn);
        }
      };

      return failure('TOPIC_NOT_FOUND:' + topicName);
    });
  });
}

function sendFn(topicName, notifData) {
  getTopicArn(notifData.topic || defaultSnsTopicName, function(err, topicArn) {
    if (err) {
      return callbackFn(err,null);
    }

    var snsNotif = {
      Message: JSON.stringify(notifData.message),
      TopicArn: topicArn
    };

    if (notifData.attributes) {
      snsNotif.MessageAttributes = notifData.attributes;
    }

    snsNotif.Subject = notifData.subject || notifData.message;
    sns.publish(snsNotif, function(err, data) {
      if (err) {
        callbackFn(err, null);
        return;
      }

      callbackFn(null, data);
    });
  });
};

/**
 * Retrieve event (SNS)
 * @param event
 * @returns {Promise.<TResult>}
 */

function getFn(event) {
  return new Promise((success, failure) => {
    if (event.Records && event.Records[0] && event.Records[0].Sns) {
      const snsEvent = JSON.parse(event.Records[0].Sns.Message);
      return success(snsEvent);
    } else {
      return failure('No event');
    }
  });
}

module.exports = exports = {
  sendMessage: sendFn,
  getMessage: getFn
};