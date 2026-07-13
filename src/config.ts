/**
 * Runtime-evaluated connection config.
 * Never reads VITE_ env vars so a stale production build cannot
 * accidentally override the local-dev endpoint.
 */
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "");

/** Backend REST API base URL */
export const API_BASE = isLocal
  ? `http://localhost:5174`
  : "https://animebattle.up.railway.app";

/** Socket.io server URL — same host as REST API */
export const SOCKET_URL = API_BASE;
