'use strict';

/**
 * Library / module for sending notifications usins Amazon SNS
 */

const AWS = require('aws-sdk');

// Initialize AWS and DynamoDB (for session access)
if (typeof AWS.config.region !== 'string') {
  console.log('No region found, defaulting to us-east-1');
  AWS.config.update({ region: 'us-east-1' });
}

const sns = new AWS.SNS();

/**
 * Finds topic by topic name
 * @param topicName
 * @returns {Promise}
 */
function getTopicArn(topicName) {
  return new Promise((resolve, reject) => {
    sns.listTopics('', (err, data) => {
      if (err) {
        return reject(err);
      }
      const arnRe = new RegExp(`arn:.+:${topicName}`);
      const topics = data.Topics || [];
      const matchedTopicArns =
        topics
          .reduce((result, topic) => {
            if (topic.TopicArn.match(arnRe)) {
              result.push(topic.TopicArn);
            }
            return result;
          }, []);

      if (matchedTopicArns.length > 0) {
        return resolve(matchedTopicArns[0]);
      }

      return reject(`TOPIC_NOT_FOUND: ${topicName}`);
    });
  });
}

/**
 * Sends message
 * @param topicName
 * @param notifData
 */
const sendMessage = (topicName, notifData) => new Promise((resolve, reject) => {
  getTopicArn(topicName)
    .then((topicArn) => {
      Object.assign(notifData.message, { stage: process.env.SERVERLESS_STAGE });
      const snsNotif = {
        Message: JSON.stringify(notifData.message),
        TopicArn: topicArn
      };

      if (notifData.attributes) {
        snsNotif.MessageAttributes = notifData.attributes;
      }

      snsNotif.Subject = notifData.subject || 'NOTIFICATION';

      if (process.env.SILENT) {
        return resolve(snsNotif);
      }

      return sns.publish(snsNotif, (err, data) => {
        if (err) {
          return reject(err);
        }
        snsNotif.messageId = data.MessageId;
        return resolve(snsNotif);
      });
    })
    .catch(error => reject(error));
});

/**
 * Retrieve event (SNS)
 * @param event
 * @returns {Promise.<TResult>}
 */

function getMessage(event) {
  return new Promise((resolve, reject) => {
    if (event.Records && event.Records[0] && event.Records[0].Sns) {
      const snsEvent = JSON.parse(event.Records[0].Sns.Message);
      return resolve(snsEvent);
    }
    return reject('No event');
  });
}

module.exports = {
  sendMessage,
  getMessage
};
