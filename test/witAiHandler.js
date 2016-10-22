'use strict';

// tests for witAiHandler
// Generated by serverless-mocha-plugin

require('dotenv').config();
const mod = require('../wit-ai/handler.js');
const mochaPlugin = require('serverless-mocha-plugin');
const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;

const liveFunction = {
  region: process.env.SERVERLESS_REGION,
  lambdaFunction: `${process.env.SERVERLESS_PROJECT}-witAiHandler`
};

const wrapped = lambdaWrapper.wrap(mod, { handler: 'handler' });
// Do not actually send messages
process.env.SILENT = 1;

function buildMessage(snsEvent) {
  return {
    Records: [{
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn: 'arn:aws:sns:us-east-1:869231578214:sc5-serverless-messenger-bot-witAiTopic-dev:9752702a-cfd3-4711-b0c1-eda9f5f87635',
      Sns: {
        Subject: 'SUBJECT',
        Message: JSON.stringify(snsEvent, null)
      }
    }]
  };
}

describe('witAiHandler', () => {
  before((done) => {
//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

    done();
  });

  it('Send text to Wit.ai (via SNS) and receive a response', (done) => {
    const snsEvent = {
      stage: 'dev',
      id: Math.round(Math.random() * 10000),
      updated: Date.now(),
      sender: {
        id: process.env.FACEBOOK_ID_FOR_TESTS,
        name: 'John Smith'
      },
      message: { text: 'What is the weather in Rome?' }
    };
    wrapped.run(buildMessage(snsEvent), (err, response) => {
      if (err) {
        return done(err);
      }
      expect(response.text).to.match(/[a-z]+/i);
      return done();
    });
  });
});

// Implement your own bot cases here
describe('Weather bot', () => {
  it('Tests current weather', (done) => {
    wrapped.run(buildMessage({
      stage: 'dev',
      id: Math.round(Math.random() * 10000),
      updated: Date.now(),
      sender: {
        id: process.env.FACEBOOK_ID_FOR_TESTS,
        name: 'John Smith'
      },
      message: { text: 'What is the weather?' }
    }), (err, response) => {
      if (err) {
        return done(err);
      }
      const snsMsg = JSON.parse(response.Message);
      expect(snsMsg.recipient.id).to.equal(process.env.FACEBOOK_ID_FOR_TESTS);
      expect(snsMsg.message.text).to.match(/Where are you/);
      return done();
    });
  });

  it('Tests current weather in London', (done) => {
    wrapped.run(buildMessage({
      stage: 'dev',
      id: Math.round(Math.random() * 10000),
      updated: Date.now(),
      sender: {
        id: process.env.FACEBOOK_ID_FOR_TESTS,
        name: 'John Smith'
      },
      message: { text: 'How will the weather be in London?' }
    }), (err, response) => {
      if (err) {
        return done(err);
      }
      const snsMsg = JSON.parse(response.Message);
      expect(snsMsg.recipient.id).to.equal(process.env.FACEBOOK_ID_FOR_TESTS);
      expect(snsMsg.message.text).to.match(/London/);
      expect(snsMsg.message.text).to.match(/temperature/);
      return done();
    });
  });

  it('Tests tomorrows forecast in London', (done) => {
    wrapped.run(buildMessage({
      stage: 'dev',
      id: Math.round(Math.random() * 10000),
      updated: Date.now(),
      sender: {
        id: process.env.FACEBOOK_ID_FOR_TESTS,
        name: 'John Smith'
      },
      message: { text: 'How will the weather be in London tomorrow?' }
    }), (err, response) => {
      if (err) {
        return done(err);
      }
      const snsMsg = JSON.parse(response.Message);
      expect(snsMsg.recipient.id).to.equal(process.env.FACEBOOK_ID_FOR_TESTS);
      expect(snsMsg.message.text).to.match(/London/);
      expect(snsMsg.message.text).to.match(/temperature/);
      expect(snsMsg.message.text).to.match(/tomorrow/);
      return done();
    });
  });
});
