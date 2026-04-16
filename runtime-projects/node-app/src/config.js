const fs = require("node:fs");
const path = require("node:path");

function readRequiredSecret(name) {
  const directValue = process.env[name];
  if (directValue && directValue.trim()) {
    return directValue.trim();
  }

  const filePath = process.env[`${name}_FILE`];
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Secret file for ${name} was not found at: ${resolvedPath}`);
    }
    return fs.readFileSync(resolvedPath, "utf8").trim();
  }

  throw new Error(`Missing required secret ${name}. Set ${name} or ${name}_FILE.`);
}

function readNumber(name, defaultValue) {
  const raw = process.env[name];
  if (!raw) {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number.`);
  }

  return parsed;
}

function maskSecret(value) {
  if (!value) {
    return "";
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

const config = {
  appName: process.env.APP_NAME ?? "node-app",
  appEnv: process.env.APP_ENV ?? "development",
  port: readNumber("APP_PORT", 3000),
  apiKey: readRequiredSecret("APP_API_KEY"),
  signingSecret: readRequiredSecret("APP_SIGNING_SECRET"),
};

module.exports = {
  config,
  maskSecret,
};
