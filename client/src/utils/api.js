// src/lib/api.js
import axios from "axios";
import useAuthStore from "../store/authStore"; // твой zustand store

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ← твой серверный URL (можно вынести в .env позже)
  timeout: 10000, // 10 секунд — таймаут
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor для добавления токена в каждый запрос
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    console.log('Interceptor: token =', token ? 'есть' : 'нет');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor для обработки ошибок (опционально, но полезно)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен просрочен или invalid → логаут
      useAuthStore.getState().logout();
      // Можно перенаправить на /auth
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

export default api;
