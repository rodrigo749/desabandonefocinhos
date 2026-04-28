export function getApiUrl({ client = true } = {}) {
  // URL de produção (Render)
  const RENDER_URL = "https://desabandonefocinhos-api.onrender.com";
  const fallback = process.env.NODE_ENV === "production" ? RENDER_URL : `http://localhost:${process.env.PORT || 3000}`;
  const raw = client ? process.env.NEXT_PUBLIC_PETZ_API_URL : process.env.PETZ_API_URL;
  const url = (raw || fallback).trim().replace(/\/$/, "");
  return url;
}

export default getApiUrl;
