import axios from 'axios';

// 1. Create the base Axios instance
const axiosInstance = axios.create({
  baseURL: '',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject x-user-uid, x-user-email, and X-Tenant-ID based on platform localStorage
  let tenantId = 'default';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Map platform user id (UUID) to x-user-uid
      if (user.id) config.headers['x-user-uid'] = user.id;
      if (user.email) config.headers['x-user-email'] = user.email;
    }
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      tenantId = tenant;
    }
  } catch (e) { /* ignore */ }

  config.headers['X-Tenant-ID'] = tenantId;
  return config;
});

// Response interceptor to dynamically unwrap ApiResponse envelopes
axiosInstance.interceptors.response.use(
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

// 2. Define the adapter function to support Fetch-like signatures
const api: any = async (url: string, options: any = {}) => {
  // Convert Fetch options to Axios config
  const config: any = {
    url,
    method: options.method || 'GET',
    headers: options.headers || {},
  };

  if (options.body) {
    try {
      config.data = JSON.parse(options.body);
    } catch {
      config.data = options.body;
    }
  }

  try {
    const response = await axiosInstance(config);
    // Return a Fetch-like response wrapper
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.data,
      data: response.data,
      headers: response.headers,
    };
  } catch (error: any) {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        json: async () => error.response.data,
        data: error.response.data,
        headers: error.response.headers,
      };
    }
    throw error;
  }
};

// 3. Attach Axios instance methods to the api function
api.get = axiosInstance.get.bind(axiosInstance);
api.post = axiosInstance.post.bind(axiosInstance);
api.put = axiosInstance.put.bind(axiosInstance);
api.delete = axiosInstance.delete.bind(axiosInstance);
api.interceptors = axiosInstance.interceptors;

export default api;
