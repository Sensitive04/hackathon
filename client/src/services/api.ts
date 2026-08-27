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

  getMyListings: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetch(`${API_URL}/marketplace/my-listings${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  purchaseItem: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/purchase`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  contactSeller: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/contact`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  confirmSale: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/confirm-sale`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  cancelSale: (id: string) =>
    fetch(`${API_URL}/marketplace/${id}/cancel-sale`, {
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

  getAdminListings: (page = 1, listingType?: string) => {
    let url = `${API_URL}/admin/listings?page=${page}`;
    if (listingType) url += `&listingType=${listingType}`;
    return fetch(url, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  deleteAdminListing: (id: string) =>
    fetch(`${API_URL}/admin/listings/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminPosts: (page = 1, type?: string) => {
    let url = `${API_URL}/admin/posts?page=${page}`;
    if (type) url += `&type=${type}`;
    return fetch(url, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  deleteAdminPost: (id: string) =>
    fetch(`${API_URL}/admin/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  updateAdminCampaignStatus: (id: string, status: string) =>
    fetch(`${API_URL}/admin/posts/${id}/campaign-status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getAdminStats: () =>
    fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Posts / Activity Feed
  getFeed: (page = 1, params?: Record<string, string>) => {
    const q = new URLSearchParams({ page: String(page) });
    if (params) Object.entries(params).forEach(([k, v]) => q.set(k, v));
    return fetch(`${API_URL}/posts?${q}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  createPost: (data: { content: string; images?: string[]; hashtags?: string[]; campaignStatus?: string; volunteerNeeded?: number }) =>
    fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deletePost: (id: string) =>
    fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  updatePost: (id: string, data: { content?: string; images?: string[]; hashtags?: string[]; campaignStatus?: string }) =>
    fetch(`${API_URL}/posts/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  likePost: (id: string) =>
    fetch(`${API_URL}/posts/${id}/like`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  joinCampaign: (id: string) =>
    fetch(`${API_URL}/posts/${id}/join`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  startCampaign: (id: string) =>
    fetch(`${API_URL}/posts/${id}/start`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  endCampaign: (id: string) =>
    fetch(`${API_URL}/posts/${id}/end`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  getCampaignChats: () =>
    fetch(`${API_URL}/posts/campaign-chats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getChatMessages: (conversationId: string) =>
    fetch(`${API_URL}/posts/chat/${conversationId}/messages`, {
      headers: getHeaders(),
    }).then(handleResponse),

  sendChatMessage: (conversationId: string, content: string) =>
    fetch(`${API_URL}/posts/chat/${conversationId}/messages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }).then(handleResponse),

  // Comments
  getComments: (postId: string) =>
    fetch(`${API_URL}/posts/${postId}/comments`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createComment: (postId: string, text: string) =>
    fetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),

  // Messages
  getConversations: (listingId?: string) => {
    const params = new URLSearchParams();
    if (listingId) params.set("listingId", listingId);
    const query = params.toString() ? `?${params}` : "";
    return fetch(`${API_URL}/messages/conversations${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

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

  deleteConversation: (conversationId: string) =>
    fetch(`${API_URL}/messages/${conversationId}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  // Knowledge Chatbot
  chat: (message: string, history: { role: "user" | "assistant"; content: string }[]) =>
    fetch(`${API_URL}/knowledge/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message, history }),
    }).then(handleResponse),
};
