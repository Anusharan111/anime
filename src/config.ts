/**
 * Runtime-evaluated connection config.
 */
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "");

/** Backend REST API base URL */
export const API_BASE = isLocal
  ? `http://localhost:5174`
  : "";
