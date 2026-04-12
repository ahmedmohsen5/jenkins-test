# Jenkins Node.js Sample App

This is a simple Node.js sample app for CI/CD practice.

## Scripts

- `npm ci` installs dependencies from lockfile
- `npm run build` copies source files into `dist/`
- `npm test` runs unit tests
- `npm start` starts the HTTP server on port `3000` (or `PORT`)

## Endpoints

- `GET /` returns a basic status message
- `GET /health` returns JSON health status
- `GET /hello?name=YourName` returns a greeting
