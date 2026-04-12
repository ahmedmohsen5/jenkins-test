'use strict';

const http = require('node:http');
const { URL } = require('node:url');
const { buildGreeting, getHealth } = require('./app');

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getHealth()));
    return;
  }

  if (url.pathname === '/hello') {
    const name = url.searchParams.get('name') || 'World';
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(buildGreeting(name));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Sample Node.js app is running');
});

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

module.exports = server;
