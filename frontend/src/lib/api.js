const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

function getHeaders() {
  const token = localStorage.getItem('af_auth_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const mergedOptions = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json().catch(() => ({ success: true }));
}

export function fetchStats() {
  return request('/reports/dashboard');
}

export function fetchAnalytics() {
  return request('/reports/analytics');
}

export function fetchDepartments() {
  return request('/departments');
}

export function createDepartment(payload) {
  return request('/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDepartment(id, payload) {
  return request(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchCategories() {
  return request('/categories');
}

export function createCategory(payload) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id, payload) {
  return request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchEmployees() {
  return request('/employees');
}

export function promoteEmployee(id, roleName) {
  return request(`/employees/${id}/promote`, {
    method: 'PUT',
    body: JSON.stringify({ role: roleName }),
  });
}

export function fetchAssets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);
  if (filters.status && filters.status !== 'Any Status') params.append('status', filters.status);
  if (filters.deptId) params.append('deptId', filters.deptId);
  if (filters.location) params.append('location', filters.location);
  
  const queryStr = params.toString();
  return request(`/assets${queryStr ? `?${queryStr}` : ''}`);
}

export function fetchAssetDetail(id) {
  return request(`/assets/${id}`);
}

export function fetchAssetHistory(id) {
  return request(`/assets/${id}/history`);
}

export function registerAsset(payload) {
  return request('/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function allocateAsset(payload) {
  return request('/allocations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function returnAsset(payload) {
  return request('/allocations/return', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchTransfers() {
  return request('/transfers');
}

export function requestTransfer(payload) {
  return request('/transfers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function approveTransfer(id, approvedById) {
  return request(`/transfers/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approvedById }),
  });
}

export function rejectTransfer(id, rejectedById, remarks) {
  return request(`/transfers/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejectedById, remarks }),
  });
}

export function fetchResources() {
  return request('/resources');
}

export function createResource(payload) {
  return request('/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchBookings() {
  return request('/bookings');
}

export function bookResource(payload) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelBooking(id) {
  return request(`/bookings/${id}/cancel`, {
    method: 'PUT',
  });
}

export function fetchMaintenanceRequests() {
  return request('/maintenance');
}

export function raiseMaintenanceRequest(payload) {
  return request('/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMaintenanceStatus(id, payload) {
  return request(`/maintenance/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchAuditCycles() {
  return request('/audits');
}

export function fetchAuditEntries(cycleId) {
  return request(`/audits/${cycleId}/entries`);
}

export function createAuditCycle(payload) {
  return request('/audits', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyAuditAsset(cycleId, assetId, payload) {
  return request(`/audits/${cycleId}/entries/${assetId}/verify`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function closeAuditCycle(cycleId) {
  return request(`/audits/${cycleId}/close`, {
    method: 'PUT',
  });
}

export function fetchNotifications(employeeId) {
  return request(`/notifications/employee/${employeeId}`);
}

export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export function fetchActivityLogs() {
  return request('/logs');
}
