import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local or .env if it exists
function loadEnvFile() {
  // Try .env.local first, then fall back to .env
  let envFilePath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envFilePath)) {
    envFilePath = path.join(process.cwd(), ".env");
  }

  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, "utf-8");

    // Split by lines and process
    const lines = envContent.split("\n");
    let currentKey = "";
    let currentValue = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        if (currentKey && currentValue) {
          // Save previous variable
          if (!process.env[currentKey]) {
            process.env[currentKey] = currentValue;
          }
          currentKey = "";
          currentValue = "";
        }
        continue;
      }

      // Check if this is a new variable (KEY=value, starts with uppercase letter)
      if (/^[A-Z_]+=/.test(trimmed)) {
        // Save previous variable if exists
        if (currentKey && currentValue) {
          if (!process.env[currentKey]) {
            process.env[currentKey] = currentValue;
          }
        }

        // Parse new variable
        const eqIndex = trimmed.indexOf("=");
        currentKey = trimmed.substring(0, eqIndex).trim();
        currentValue = trimmed.substring(eqIndex + 1).trim();
      } else if (currentKey) {
        // Continuation of current variable (multiline value)
        currentValue += trimmed;
      }
    }

    // Save last variable
    if (currentKey && currentValue) {
      if (!process.env[currentKey]) {
        process.env[currentKey] = currentValue;
      }
    }
  }
}

loadEnvFile();

export const config = {
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,

  getServiceAccount() {
    // Try to parse as JSON first (if the entire content was pasted as a variable)
    if (this.firebaseServiceAccountJson) {
      try {
        return JSON.parse(this.firebaseServiceAccountJson);
      } catch {
        // Fall through to file path method
      }
    }

    // Try to read from file path
    if (this.firebaseServiceAccountPath) {
      try {
        const content = fs.readFileSync(this.firebaseServiceAccountPath, "utf-8");
        return JSON.parse(content);
      } catch (error) {
        throw new Error(
          `Failed to read service account from ${this.firebaseServiceAccountPath}: ${String(error)}`
        );
      }
    }

    throw new Error("No service account configuration found");
  },

  validate() {
    const errors: string[] = [];

    const hasPath = !!this.firebaseServiceAccountPath;
    const hasJson = !!this.firebaseServiceAccountJson;

    if (!hasPath && !hasJson) {
      errors.push(
        "Either FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON must be set"
      );
    }

    if (!this.firebaseDatabaseUrl) {
      errors.push("FIREBASE_DATABASE_URL environment variable is not set");
    }

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`
      );
    }
  },
};
