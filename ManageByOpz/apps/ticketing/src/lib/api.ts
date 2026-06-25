import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Inject x-user-uid, x-user-email, and X-Tenant-ID
  let tenantId = 'default';
  try {
    const sessionStr = localStorage.getItem('demo_user');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.uid) config.headers['x-user-uid'] = session.uid;
      if (session.email) config.headers['x-user-email'] = session.email;
      if (session.tenantId) {
        tenantId = session.tenantId;
      }
    }
  } catch { /* ignore parse errors */ }
  config.headers['X-Tenant-ID'] = tenantId;
  return config;
});

// Response interceptor to dynamically unwrap ApiResponse envelopes
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success !== undefined && 'data' in body) {
      const dataPayload = body.data;
      if (dataPayload && (typeof dataPayload === 'object' || Array.isArray(dataPayload))) {
        try {
          Object.defineProperty(dataPayload, 'data', {
            value: dataPayload,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          // Ignore if object is not extensible
        }
      }
      response.data = dataPayload;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
