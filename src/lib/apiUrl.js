export function getApiUrl() {
  // URL de produção (Render)
  const RENDER_URL = "https://desabandonefocinhos-api.onrender.com";
  const fallback = RENDER_URL;
  const raw = process.env.NEXT_PUBLIC_PETZ_API_URL;
  const url = (raw || fallback).trim().replace(/\/$/, "");
  return url;
}

export default getApiUrl;
