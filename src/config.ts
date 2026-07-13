const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

/** Backend REST API — empty string in dev uses Vite proxy. */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (isLocal ? "http://localhost:5174" : "https://animebattle.up.railway.app");

/** Socket.io server — must be a long-running Node host (not Vercel serverless). */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE;
