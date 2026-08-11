/**
 * Starts json-server and Expo together.
 *
 * Running both under a process runner (concurrently and friends) hands Expo a
 * piped stdin, and Expo turns its interactive menu off when stdin is not a TTY
 * — no `w`, `i`, `a` or `r`. So Expo inherits this process's terminal instead,
 * and the API runs alongside with its output prefixed.
 *
 * json-server is spawned as a direct child rather than through `npm --prefix`.
 * An `npm` in between exits without taking json-server with it, orphaning a
 * process that keeps port 3008 and makes the next run fail with EADDRINUSE.
 */
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = path.join(root, "phone-server");
const isWindows = process.platform === "win32";
const bin = (dir, name) =>
  path.join(dir, "node_modules", ".bin", isWindows ? `${name}.cmd` : name);

const colour = (code, text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const API_TAG = colour(34, "[api]");
const APP_TAG = colour(35, "[app]");

let shuttingDown = false;

const api = spawn(bin(serverDir, "json-server"), ["-p", "3008", "phones.json"], {
  cwd: serverDir,
  stdio: ["ignore", "pipe", "pipe"],
  shell: isWindows,
});

for (const stream of [api.stdout, api.stderr]) {
  createInterface({ input: stream }).on("line", (line) => {
    console.log(`${API_TAG} ${line}`);
  });
}

api.on("error", (err) => {
  console.error(`${API_TAG} could not start json-server: ${err.message}`);
});

// Expo gets the real terminal, which is what keeps its keyboard shortcuts alive.
const app = spawn(bin(root, "expo"), ["start", ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  shell: isWindows,
});

const stop = (code) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (api.exitCode === null && !api.killed) api.kill("SIGTERM");
  if (app.exitCode === null && !app.killed) app.kill("SIGTERM");
  process.exitCode = code ?? 0;
};

// Expo owns the foreground, so Ctrl+C reaches it directly; this is for the
// cases where it does not, and to make sure the API never outlives the app.
app.on("exit", (code) => stop(code ?? 0));
api.on("exit", (code) => {
  if (shuttingDown) return;
  console.error(`${API_TAG} exited with code ${code} — stopping the app too.`);
  stop(code ?? 1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stop(0));
}
process.on("exit", () => {
  if (api.exitCode === null && !api.killed) api.kill("SIGKILL");
});
