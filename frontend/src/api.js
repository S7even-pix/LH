// GridGuard API Client

const BASE_URL = '/api';

export async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

// Consumer APIs
export const submitOutageReport = (data) =>
  fetchJson('/reports', { method: 'POST', body: JSON.stringify(data) });

export const getConsumerReports = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetchJson(`/reports${q ? `?${q}` : ''}`);
};

export const getReportDetail = (idOrNumber) =>
  fetchJson(`/reports/${idOrNumber}`);

// Incident APIs
export const getIncidents = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetchJson(`/incidents${q ? `?${q}` : ''}`);
};

export const getIncidentDetail = (id) =>
  fetchJson(`/incidents/${id}`);

export const updateIncidentStatus = (id, data) =>
  fetchJson(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) });

export const assignIncidentTeam = (id, data) =>
  fetchJson(`/incidents/${id}/assign`, { method: 'PATCH', body: JSON.stringify(data) });

export const overrideIncidentPriority = (id, data) =>
  fetchJson(`/incidents/${id}/priority`, { method: 'PATCH', body: JSON.stringify(data) });

export const updateIncidentETR = (id, data) =>
  fetchJson(`/incidents/${id}/etr`, { method: 'PATCH', body: JSON.stringify(data) });

// Repair Teams
export const getRepairTeams = () =>
  fetchJson('/teams');

export const updateTeamStatus = (id, status) =>
  fetchJson(`/teams/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' });

// Escalations & Supervisor
export const getEscalations = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetchJson(`/escalations${q ? `?${q}` : ''}`);
};

export const acknowledgeEscalation = (id, data) =>
  fetchJson(`/escalations/${id}/acknowledge`, { method: 'POST', body: JSON.stringify(data) });

export const reviewEscalation = (id, data) =>
  fetchJson(`/escalations/${id}/review`, { method: 'POST', body: JSON.stringify(data) });

export const addSupervisorComment = (id, data) =>
  fetchJson(`/escalations/${id}/comments`, { method: 'POST', body: JSON.stringify(data) });

export const getSLAConfigs = () =>
  fetchJson('/sla-configs');

export const updateSLAConfig = (data) =>
  fetchJson('/sla-configs', { method: 'PUT', body: JSON.stringify(data) });

export const triggerEscalationCheck = () =>
  fetchJson('/engine/check-escalations', { method: 'POST' });

// Analytics
export const getAnalytics = () =>
  fetchJson('/analytics');

// Notifications
export const getNotifications = (role) =>
  fetchJson(`/notifications${role ? `?role=${role}` : ''}`);

export const markNotificationRead = (id) =>
  fetchJson(`/notifications/${id}/read`, { method: 'POST' });

// Demo Seeding
export const reseedDemoData = () =>
  fetchJson('/seed', { method: 'POST' });
