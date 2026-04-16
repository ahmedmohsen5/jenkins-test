# .NET App

Small minimal API with:

- Environment-based configuration
- Required secrets (`APP_API_KEY`, `APP_SIGNING_SECRET`)
- Secret file fallback using `*_FILE` variables
- Optional .NET User Secrets support

## Setup

Set secrets with .NET User Secrets:

```bash
dotnet user-secrets set APP_API_KEY "replace-with-api-key"
dotnet user-secrets set APP_SIGNING_SECRET "replace-with-signing-secret"
```

Set non-secret config via environment variables if needed:

```bash
set APP_PORT=5050
```

Run:

```bash
dotnet run
```

## Endpoints

- `GET /health`
- `GET /config` (returns masked secrets)
- `GET /tasks`
- `POST /tasks` (requires `x-api-key` header)
