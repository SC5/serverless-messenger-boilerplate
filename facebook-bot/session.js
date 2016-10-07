'use strict';

const Promise = require('bluebird');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Initialize AWS and DynamoDB (for session access)
if (typeof AWS.config.region !== 'string') {
  console.log('No region found, defaulting to us-east-1');
  AWS.config.update({ region: 'us-east-1' });
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();

function sessionTable() {
  return `${process.env.SERVERLESS_PROJECT}-sessions-${process.env.SERVERLESS_STAGE}`;
}

function readSession(id) {
  console.log('Read session', id);
  return new Promise((resolve, reject) => {
    const params = {
      Key: { id: id.toString() },
      TableName: sessionTable(),
      ConsistentRead: true
    };

    console.log('params', params);

    dynamoDB.get(params, (err, data) => {
      // console.log('Dynamo:', AWS.config.region + '/' + sessionTable());
      console.log(err, data);

      if (err) {
        return reject(err.toString());
      }

      if (data.Item) {
        return resolve(data.Item);
      }

      return resolve({
        id,
        context: {}
      });
    });
  });
}

function writeSession(session) {
  return new Promise((success, reject) => {
    if (!session.id) {
      reject('NO_SESSION_ID');
    }

    Object.assign(session, { updated: Date.now() });

    const sessionDoc = {
      TableName: sessionTable(),
      Item: session
    };

    dynamoDB.put(sessionDoc, (err) => {
      if (err) {
        return reject(err);
      }

      return success(session);
    });
  });
}

module.exports.readSession = readSession;
module.exports.writeSession = writeSession;
