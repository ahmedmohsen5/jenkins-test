# Runtime Projects

This folder contains three API starter projects:

- `node-app` (Node.js + Express)
- `python-app` (Python + Flask)
- `dotnet-app` (.NET Minimal API)

Each project now includes:

- multiple API endpoints (`/health`, `/config`, `/tasks`)
- env-based configuration
- required secrets (`APP_API_KEY`, `APP_SIGNING_SECRET`)
- secret-file fallback (`APP_API_KEY_FILE`, `APP_SIGNING_SECRET_FILE`)

## Project Paths

- `runtime-projects/node-app`
- `runtime-projects/python-app`
- `runtime-projects/dotnet-app`

## Notes

- copy `.env.example` to `.env` for Node and Python
- never commit real secrets
- `.env` is already ignored in each project
