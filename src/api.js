const getApiBaseUrl = () => {
  // En développement, l'URL est relative grâce au proxy Vite.
  // En production, VITE_API_URL sera défini par Render.
  return import.meta.env.VITE_API_URL || "/api";
};

export const API_BASE_URL = getApiBaseUrl();
