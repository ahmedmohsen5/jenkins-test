from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv


load_dotenv()


def _read_required_secret(name: str) -> str:
    direct_value = os.getenv(name, "").strip()
    if direct_value:
        return direct_value

    file_var = f"{name}_FILE"
    file_path = os.getenv(file_var, "").strip()
    if file_path:
        resolved = Path(file_path).expanduser().resolve()
        if not resolved.exists():
            raise RuntimeError(f"Secret file for {name} was not found at: {resolved}")
        return resolved.read_text(encoding="utf-8").strip()

    raise RuntimeError(f"Missing required secret {name}. Set {name} or {file_var}.")


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_env: str
    port: int
    api_key: str
    signing_secret: str

    @property
    def masked_api_key(self) -> str:
        return _mask_secret(self.api_key)

    @property
    def masked_signing_secret(self) -> str:
        return _mask_secret(self.signing_secret)


def _mask_secret(value: str) -> str:
    if len(value) <= 4:
        return "****"
    return f"{value[:2]}****{value[-2:]}"


def load_settings() -> Settings:
    port_raw = os.getenv("APP_PORT", "5000")
    try:
        port = int(port_raw)
    except ValueError as exc:
        raise RuntimeError("APP_PORT must be a number.") from exc

    return Settings(
        app_name=os.getenv("APP_NAME", "python-app"),
        app_env=os.getenv("APP_ENV", "development"),
        port=port,
        api_key=_read_required_secret("APP_API_KEY"),
        signing_secret=_read_required_secret("APP_SIGNING_SECRET"),
    )
