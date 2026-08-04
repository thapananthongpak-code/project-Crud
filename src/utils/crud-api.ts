import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEV_PORT = 3008;

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

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${DEV_PORT}`;
  }

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

/** Turns an axios failure into something worth showing a user. */
export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "The server took too long to answer. Please try again.";
    }
    if (!err.response) {
      return `Can't reach the server at ${API_BASE_URL}. Start it with "npm start" in phone-server, and keep your phone on the same Wi-Fi.`;
    }
    if (err.response.status === 404) return "That contact no longer exists.";
    return `The server replied with an error (${err.response.status}).`;
  }
  return "Something went wrong. Please try again.";
}

export default api;
