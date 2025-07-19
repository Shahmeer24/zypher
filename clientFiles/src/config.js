const isDev = window.location.hostname === "localhost";

export const BASE_URL = isDev
  ? "http://localhost:5000"
  : "https://zypher-24-backend.onrender.com";
