'use strict';

function buildGreeting(name = 'World') {
  return `Hello, ${name}!`;
}

function getHealth() {
  return { status: 'ok' };
}

module.exports = { buildGreeting, getHealth };
