import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEV_PORT = 3008;

/** Metro reports a bare IPv4 address when it is serving over the LAN. */
const LAN_IP = /^\d{1,3}(\.\d{1,3}){3}$/;

function metroHost(): string | undefined {
  return Constants.expoConfig?.hostUri?.split(":")[0];
}

/**
 * `--tunnel` serves Metro from a public hostname (e.g. `*.exp.direct`), which
 * proxies the bundle only. json-server stays on the dev machine's LAN, so there
 * is no address the device can derive for it — the API needs an explicit
 * EXPO_PUBLIC_API_URL. Detected so the error can say that instead of blaming
 * the Wi-Fi.
 */
export const IS_TUNNELLED = (() => {
  if (process.env.EXPO_PUBLIC_API_URL?.trim()) return false;
  const host = metroHost();
  return !!host && !LAN_IP.test(host) && host !== "localhost" && host !== "127.0.0.1";
})();

/**
 * `http://localhost` only ever works in a web browser or on the machine running
 * the server. On a phone (Expo Go) or an Android emulator it points at the
 * device itself, so every request fails. Derive the dev machine's LAN address
 * from the Metro host instead, and let EXPO_PUBLIC_API_URL override everything
 * when pointing at a deployed API.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const host = metroHost();
  if (host && LAN_IP.test(host)) return `http://${host}:${DEV_PORT}`;

  // Android emulators reach the host machine through a dedicated alias.
  if (Platform.OS === "android") return `http://10.0.2.2:${DEV_PORT}`;

  return `http://localhost:${DEV_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** A delete or update whose target the server no longer has. */
export function isNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

/** Turns an axios failure into something worth showing a user. */
export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "The server took too long to answer. Please try again.";
    }
    if (!err.response) {
      if (IS_TUNNELLED) {
        return "A tunnel only serves the app, not the API. Set EXPO_PUBLIC_API_URL in .env to an address your device can reach, or run Expo on the same Wi-Fi instead.";
      }
      return `Can't reach the server at ${API_BASE_URL}. Start it with "npm start", and keep your phone on the same Wi-Fi.`;
    }
    if (err.response.status === 404) return "That contact no longer exists.";
    return `The server replied with an error (${err.response.status}).`;
  }
  return "Something went wrong. Please try again.";
}

export default api;
