import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

if (process.platform !== "win32") process.exit(0);

const envFiles = [".env", ".env.local"]
  .map((file) => resolve(process.cwd(), file))
  .filter(existsSync)
  .map((file) => readFileSync(file, "utf8"));

const environment = Object.assign({}, ...envFiles.map((contents) => Object.fromEntries(
  contents.split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"']*)["']?\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value]),
)));

const databaseUrl = process.env.DATABASE_URL ?? environment.DATABASE_URL;
if (databaseUrl && !databaseUrl.includes("127.0.0.1:5433")) process.exit(0);

const result = spawnSync("powershell.exe", [
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  resolve(process.cwd(), "scripts/setup-local-database.ps1"),
], { stdio: "inherit", cwd: process.cwd() });

if (result.error) throw result.error;
process.exit(result.status ?? 1);
