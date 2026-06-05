/** Backend REST API — empty string in dev uses Vite proxy. */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://animebattle.up.railway.app");

/** Socket.io server — must be a long-running Node host (not Vercel serverless). */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE || "http://localhost:6000";
