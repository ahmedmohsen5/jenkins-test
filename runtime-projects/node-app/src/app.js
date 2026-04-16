const express = require("express");
const { config, maskSecret } = require("./config");
const { listTasks, createTask } = require("./services/taskService");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: config.appName,
    environment: config.appEnv,
  });
});

app.get("/config", (_req, res) => {
  res.json({
    appName: config.appName,
    appEnv: config.appEnv,
    port: config.port,
    apiKey: maskSecret(config.apiKey),
    signingSecret: maskSecret(config.signingSecret),
  });
});

app.get("/tasks", (_req, res) => {
  res.json({ tasks: listTasks() });
});

app.post("/tasks", (req, res) => {
  const requestApiKey = req.header("x-api-key");
  if (requestApiKey !== config.apiKey) {
    return res.status(401).json({ error: "Unauthorized: invalid API key." });
  }

  const title = req.body?.title;
  const priority = req.body?.priority ?? "normal";

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Field 'title' is required." });
  }

  const result = createTask({ title: title.trim(), priority }, config.signingSecret);
  return res.status(201).json(result);
});

module.exports = app;
