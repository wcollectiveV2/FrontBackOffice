
export const API_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  // If the URL already ends with /api, remove it so we can consistently append /api/endpoint
  // Or better yet, ensure it DOES end with /api, and we append /endpoint.
  
  // Strategy: Ensure NO trailing /api, so we can control it.
  // If env is "http://localhost:3001/api", we return "http://localhost:3001"
  return envUrl.replace(/\/api\/?$/, '');
})();

export const getApiUrl = (endpoint: string) => {
  // endpoint should start with /api/ or just be the path
  // If endpoint starts with /api/, use it as is.
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};
