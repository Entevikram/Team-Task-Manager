import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "ttm_token";

export const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("[API REQUEST]", {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL}${config.url}`,
    data: config.data,
  });
  return config;
});

http.interceptors.response.use(
  (response) => {
    console.log("[API RESPONSE]", {
      url: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[API ERROR]", {
      url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  const maybe = error as {
    response?: { status?: number; data?: { error?: string } };
    message?: string;
  };

  if (maybe.response?.status === 404) {
    return "API endpoint not found (404). Check VITE_API_URL and route path.";
  }

  return maybe.response?.data?.error || maybe.message || fallback;
}

export { TOKEN_KEY };
