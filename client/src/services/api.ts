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

  getMyListings: () =>
    fetch(`${API_URL}/marketplace/my-listings`, {
      headers: getHeaders(),
    }).then(handleResponse),

  purchaseItem: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/purchase`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  // Admin
  getAdminUsers: (page = 1) =>
    fetch(`${API_URL}/admin/users?page=${page}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  deleteAdminUser: (id: string) =>
    fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  updateAdminUserRole: (id: string, role: string) =>
    fetch(`${API_URL}/admin/users/${id}/role`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  createAdminAccount: (name: string, email: string, password: string) =>
    fetch(`${API_URL}/admin/create-admin`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  createRecyclerAccount: (name: string, email: string, password: string) =>
    fetch(`${API_URL}/admin/create-recycler`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  getAdminListings: (page = 1) =>
    fetch(`${API_URL}/admin/listings?page=${page}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  deleteAdminListing: (id: string) =>
    fetch(`${API_URL}/admin/listings/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminStats: () =>
    fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  adminGetAllPickups: (page = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    return fetch(`${API_URL}/admin/recycle-pickups?${params}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  adminReassignPickup: (id: string, recyclerId: string | null) =>
    fetch(`${API_URL}/admin/recycle-pickups/${id}/reassign`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ recyclerId }),
    }).then(handleResponse),

  adminDeletePickup: (id: string) =>
    fetch(`${API_URL}/admin/recycle-pickups/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  // Messages
  getConversations: () =>
    fetch(`${API_URL}/messages/conversations`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createConversation: (participantId: string, listingId?: string) =>
    fetch(`${API_URL}/messages/conversations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ participantId, listingId }),
    }).then(handleResponse),

  getMessages: (conversationId: string) =>
    fetch(`${API_URL}/messages/${conversationId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  sendMessage: (conversationId: string, content: string) =>
    fetch(`${API_URL}/messages/${conversationId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }).then(handleResponse),

  markConversationRead: (conversationId: string) =>
    fetch(`${API_URL}/messages/${conversationId}/read`, {
      method: "PUT",
      headers: getHeaders(),
    }).then(handleResponse),

  // Recycle Pickups
  getPendingPickups: () =>
    fetch(`${API_URL}/recycle/pending`, {
      headers: getHeaders(),
    }).then(handleResponse),

  claimPickup: (listingId: string) =>
    fetch(`${API_URL}/recycle/${listingId}/claim`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  updatePickupStatus: (
    id: string,
    status: string,
    notes?: string,
    scheduledDate?: string
  ) =>
    fetch(`${API_URL}/recycle/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, notes, scheduledDate }),
    }).then(handleResponse),

  getMyPickups: () =>
    fetch(`${API_URL}/recycle/my-pickups`, {
      headers: getHeaders(),
    }).then(handleResponse),

};
