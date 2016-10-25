'use strict';

const AWS = require('aws-sdk');

// Initialize AWS and DynamoDB (for session access)
if (typeof AWS.config.region !== 'string') {
  console.warn('No region found, defaulting to us-east-1');
  AWS.config.update({ region: 'us-east-1' });
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * returns session table name
 * @returns {string}
 */
function sessionTable() {
  return `${process.env.SERVERLESS_PROJECT}-sessions-${process.env.SERVERLESS_STAGE}`;
}

/**
 * Reads session from DynamoDB
 * @param id
 */
function readSession(id) {
  return new Promise((resolve, reject) => {
    const params = {
      Key: { id },
      TableName: sessionTable(),
      ConsistentRead: true
    };

    dynamoDB.get(params, (err, data) => {
      if (err) {
        return reject(err.toString());
      }

      const session = Object.assign({ id, context: {} }, data.Item);
      // @todo should the context be cleared time to time?
      // How long is Wit.ai session?
      const now = Date.now();
      if (!session.updated || now - session.updated > 30000) {
        Object.assign(session, { updated: now });
        Object.assign(session, { context: {} });
      }

      // context disabled in workshop
      Object.assign(session, { context: {} });

      return resolve(session);
    });
  });
}

/**
 * Writes session to DynamoDB
 * @param session
 */
function writeSession(session) {
  return new Promise((resolve, reject) => {
    if (!session.id) {
      return reject('NO_SESSION_ID');
    }

    // Enforce id to string
    session.id = session.id + '';

    const sessionDoc = {
      TableName: sessionTable(),
      Item: session
    };

    dynamoDB.put(sessionDoc, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(session);
    });
  });
}

module.exports = {
  readSession,
  writeSession
};
