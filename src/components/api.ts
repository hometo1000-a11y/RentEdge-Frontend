const API_BASE_URL = 'https://api.homtu.in/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rentedge_token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

// ─── Session helpers ──────────────────────────────────────────────

function storeSession(data: { token: string; user: any }) {
  localStorage.setItem('rentedge_token', data.token);
  localStorage.setItem('rentedge_authenticated', 'true');
  localStorage.setItem('rentedge_user_fullname', data.user.fullName);
  localStorage.setItem('rentedge_user_email', data.user.email);
  localStorage.setItem('rentedge_user_role', data.user.role);
}

function clearSession() {
  localStorage.removeItem('rentedge_token');
  localStorage.removeItem('rentedge_authenticated');
  localStorage.removeItem('rentedge_user_fullname');
  localStorage.removeItem('rentedge_user_email');
  localStorage.removeItem('rentedge_user_role');
  localStorage.removeItem('rentedge_lifecycle_state');
  localStorage.removeItem('rentedge_selected_property_id');
}

// ─── API Methods ──────────────────────────────────────────────────

export const api = {
  // Auth — Pre-check account availability and handle JIT cleanup
  async preCheck(payload: { email: string; phone: string }) {
    return apiFetch('/auth/pre-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Auth — Complete signup with Supabase access token
  async completeSignup(payload: {
    fullName: string;
    role: string;
    supabaseAccessToken: string;
  }) {
    const data = await apiFetch('/auth/complete-signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      storeSession(data);
    }
    return data;
  },

  // Auth — Login with Supabase access token exchange
  async login(payload: { supabaseAccessToken: string }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      storeSession(data);
    }
    return data;
  },

  // Auth — Logout
  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors on logout
    }
    clearSession();
  },

  // Auth — Get current user
  async getMe() {
    return apiFetch('/auth/me');
  },

  async getPaymentInfo() {
    return apiFetch('/users/payment-info');
  },

  async savePaymentInfo(paymentData: any) {
    return apiFetch('/users/payment-info', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Properties APIs
  async getPublicProperties(filters: any = {}) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/public/properties?${queryString}` : '/public/properties';
    return apiFetch(endpoint);
  },

  async getProperties() {
    return apiFetch('/properties');
  },

  async getJoinRequests() {
    return apiFetch('/properties/join-requests');
  },

  async updateJoinRequestStatus(requestId: string, status: 'approved' | 'rejected', lease_start_date?: string) {
    return apiFetch(`/properties/join-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(lease_start_date ? { lease_start_date } : {}) })
    });
  },

  async getPropertyTenants() {
    return apiFetch('/properties/tenants');
  },

  async updateTenantRentStatus(tenantId: string, rent_status: 'paid' | 'due') {
    return apiFetch(`/properties/tenants/${tenantId}/rent-status`, {
      method: 'PUT',
      body: JSON.stringify({ rent_status })
    });
  },

  async removeTenant(tenantId: string) {
    return apiFetch(`/properties/tenants/${tenantId}`, {
      method: 'DELETE'
    });
  },

  // ─── Rent Payment Proofs ──────────────────────────────────────────

  async submitRentPaymentProof(data: any) {
    return apiFetch('/rent-payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getCurrentPaymentProof(propertyTenantId: string) {
    return apiFetch(`/rent-payments/current/${propertyTenantId}`);
  },

  async getPaymentHistory(params: { role?: string, property_id?: string, tenant_user_id?: string, page?: number, limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch(`/rent-payments/history?${query}`);
  },

  async approvePaymentProof(proofId: string) {
    return apiFetch(`/rent-payments/${proofId}/approve`, {
      method: 'PUT'
    });
  },

  async markTenantDue(propertyTenantId: string) {
    return apiFetch(`/rent-payments/tenants/${propertyTenantId}/mark-due`, {
      method: 'PUT'
    });
  },

  // ─────────────────────────────────────────────────────────────────

  async getProperty(id: string) {
    return apiFetch(`/properties/${id}`);
  },

  async createProperty(propertyData: any) {
    return apiFetch('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  async updateProperty(id: string, propertyData: any) {
    return apiFetch(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  // ImageKit
  async getImageKitAuth() {
    return apiFetch('/imagekit/auth');
  },

  async saveTempUpload(uploadData: { session_id: string; imagekit_file_id: string; image_url: string }) {
    return apiFetch('/imagekit/temp-upload', {
      method: 'POST',
      body: JSON.stringify(uploadData),
    });
  },

  async deleteTempUpload(fileId: string) {
    return apiFetch(`/imagekit/temp-upload/${fileId}`, {
      method: 'DELETE',
    });
  },

  async deleteTempUploads(sessionId: string) {
    return apiFetch(`/imagekit/temp/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async deleteProperty(id: string) {
    return apiFetch(`/properties/${id}`, {
      method: 'DELETE',
    });
  },


  async deletePropertyImage(propertyId: string, imageId: string) {
    return apiFetch(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  async setCoverImage(propertyId: string, imageId: string) {
    return apiFetch(`/properties/${propertyId}/images/${imageId}/cover`, {
      method: 'PATCH',
    });
  },

  async reorderImages(propertyId: string, orderData: { id: string, display_order: number }[]) {
    return apiFetch(`/properties/${propertyId}/images/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  },

  async addPropertyImage(propertyId: string, imageData: any) {
    return apiFetch(`/properties/${propertyId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  },


  async addPropertyContact(propertyId: string, contactData: any) {
    return apiFetch(`/properties/${propertyId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  async deletePropertyContact(propertyId: string, contactId: string) {
    return apiFetch(`/properties/${propertyId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  // Tenants APIs
  async getTenantProfile() {
    return apiFetch('/tenants/me');
  },

  async updateTenantProfile(profileData: any) {
    return apiFetch('/tenants/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async joinProperty(propertyCode: string) {
    return apiFetch('/tenants/join-property', {
      method: 'POST',
      body: JSON.stringify({ propertyCode }),
    });
  },

  async getMyProperties() {
    return apiFetch('/tenants/my-properties');
  },


};
