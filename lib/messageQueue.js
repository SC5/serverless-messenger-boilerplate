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
      if (err) {
        return failure(err);
      }
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
  return new Promise((success, failure) => { 
    getTopicArn(topicName)
    .then((topicArn) => {
      let snsNotif = {
        Message: JSON.stringify(notifData.message),
        TopicArn: topicArn
      };
      
      if (notifData.attributes) {
        snsNotif.MessageAttributes = notifData.attributes;
      }

      snsNotif.Subject = notifData.subject || 'NOTIFICATION';

      if (process.env.SILENT) {
        return success(snsNotif);
      }

      sns.publish(snsNotif, function(err, data) {
        if (err) {
          return failure(err);
        }
        snsNotif.messageId = data.MessageId;
        return success(snsNotif);
      });
    })
    .catch(error => {
      failure(error)
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