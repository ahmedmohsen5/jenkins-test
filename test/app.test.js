'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildGreeting, getHealth } = require('../src/app');

test('buildGreeting returns default greeting', () => {
  assert.equal(buildGreeting(), 'Hello, World!');
});

test('buildGreeting returns personalized greeting', () => {
  assert.equal(buildGreeting('Ahmed'), 'Hello, Ahmed!');
});

test('getHealth returns status ok', () => {
  assert.deepEqual(getHealth(), { status: 'ok' });
});
