const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

// The health route lives at the server root (/health), not under /api/v1,
// so derive the server origin from the configured API URL.
const serverOrigin = new URL(apiUrl).origin;

export const env = {
  apiUrl,
  serverOrigin,
};
