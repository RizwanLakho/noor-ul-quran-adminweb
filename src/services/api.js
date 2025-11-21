import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
};

export const quranAPI = {
  getAllSurahs: async () => {
    const response = await api.get("/api/quran/surahs");
    return response.data;
  },

  getAyah: async (surah, ayah) => {
    const response = await api.get(`/api/quran/ayah/${surah}/${ayah}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/api/quran/stats");
    return response.data;
  },
};

export const topicsAPI = {
  getAll: async () => {
    const response = await api.get("/api/topics");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/topics/${id}`);
    return response.data;
  },

  create: async (topicData) => {
    const response = await api.post("/api/topics", topicData);
    return response.data;
  },

  update: async (id, topicData) => {
    const response = await api.put(`/api/topics/${id}`, topicData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/topics/${id}`);
    return response.data;
  },
};

export const quizzesAPI = {
  getAll: async () => {
    const response = await api.get("/api/quizzes");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/quizzes/${id}`);
    return response.data;
  },

  create: async (quizData) => {
    const response = await api.post("/api/quizzes", quizData);
    return response.data;
  },

  update: async (id, quizData) => {
    const response = await api.put(`/api/quizzes/${id}`, quizData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/quizzes/${id}`);
    return response.data;
  },
};

export default api;

export const translationsAPI = {
  getAll: async () => {
    const response = await api.get('/api/translations');
    return response.data;
  },

  getByName: async (translator, language) => {
    const response = await api.get(`/api/translations/${encodeURIComponent(translator)}/${language}`);
    return response.data;
  },

  checkExists: async (translator, language) => {
    const response = await api.get('/api/translations/check', {
      params: { translator, language }
    });
    return response.data;
  },

  upload: async (formData) => {
    const response = await api.post('/api/translations/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (translator, language) => {
    const response = await api.delete(`/api/translations/${encodeURIComponent(translator)}/${language}`);
    return response.data;
  },

  getLanguages: async () => {
    const response = await api.get('/api/translations/languages');
    return response.data;
  }
};
