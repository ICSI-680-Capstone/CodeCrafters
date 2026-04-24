// In development this falls back to localhost.
// In production set NEXT_PUBLIC_SERVER_URL in your Vercel / Docker environment.
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
