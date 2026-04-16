# Python App

Small Flask API with:

- Environment-based configuration
- Required secrets (`APP_API_KEY`, `APP_SIGNING_SECRET`)
- Secret file fallback using `*_FILE` variables

## Setup

1. Copy `.env.example` to `.env`
2. Add real secret values
3. Install dependencies and run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Endpoints

- `GET /health`
- `GET /config` (returns masked secrets)
- `GET /tasks`
- `POST /tasks` (requires `x-api-key` header)
