# Node App

Small Express API with:

- Environment-based configuration
- Required secrets (`APP_API_KEY`, `APP_SIGNING_SECRET`)
- Secret file fallback using `*_FILE` variables

## Setup

1. Copy `.env.example` to `.env`
2. Fill real secret values
3. Install dependencies and start

```bash
npm install
npm start
```

## Endpoints

- `GET /health`
- `GET /config` (returns masked secrets)
- `GET /tasks`
- `POST /tasks` (requires `x-api-key` header)
