from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import hmac

from flask import Flask, jsonify, request

from config import load_settings


settings = load_settings()
app = Flask(__name__)

tasks: list[dict] = [
    {"id": 1, "title": "Set up CI", "priority": "high", "completed": False},
    {"id": 2, "title": "Write tests", "priority": "medium", "completed": False},
]
next_task_id = 3


def _build_signature(task_id: int, title: str, priority: str) -> str:
    payload = f"{task_id}:{title}:{priority}".encode("utf-8")
    key = settings.signing_secret.encode("utf-8")
    return hmac.new(key, payload, hashlib.sha256).hexdigest()[:16]


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.app_env,
            "timeUtc": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.get("/config")
def config():
    return jsonify(
        {
            "appName": settings.app_name,
            "appEnv": settings.app_env,
            "port": settings.port,
            "apiKey": settings.masked_api_key,
            "signingSecret": settings.masked_signing_secret,
        }
    )


@app.get("/tasks")
def list_tasks():
    return jsonify({"tasks": tasks})


@app.post("/tasks")
def create_task():
    global next_task_id

    request_api_key = request.headers.get("x-api-key", "")
    if request_api_key != settings.api_key:
        return jsonify({"error": "Unauthorized: invalid API key."}), 401

    body = request.get_json(silent=True) or {}
    title = str(body.get("title", "")).strip()
    priority = str(body.get("priority", "normal")).strip() or "normal"

    if not title:
        return jsonify({"error": "Field 'title' is required."}), 400

    new_task = {
        "id": next_task_id,
        "title": title,
        "priority": priority,
        "completed": False,
    }
    signature = _build_signature(new_task["id"], new_task["title"], new_task["priority"])

    tasks.append(new_task)
    next_task_id += 1

    return jsonify({"task": new_task, "signature": signature}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.port, debug=settings.app_env == "development")
