const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getHeaders(isFormData = false): HeadersInit {
  const headers: HeadersInit = {};
  const token = localStorage.getItem("greentech_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Satellite
  analyzeSatellite: (region: string, lat: number, lng: number) =>
    fetch(`${API_URL}/satellite/analyze`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ region, coordinates: { lat, lng } }),
    }).then(handleResponse),

  getSatelliteHistory: () =>
    fetch(`${API_URL}/satellite/history`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Marketplace
  analyzeItem: (description: string, imageBase64?: string) =>
    fetch(`${API_URL}/marketplace/analyze`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ description, imageBase64 }),
    }).then(handleResponse),

  listItem: (item: any) =>
    fetch(`${API_URL}/marketplace/list`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(item),
    }).then(handleResponse),

  getMarketplace: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetch(`${API_URL}/marketplace${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getItem: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  purchaseItem: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/purchase`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  getMyListings: () =>
    fetch(`${API_URL}/marketplace/my-listings`, {
      headers: getHeaders(),
    }).then(handleResponse),
};
