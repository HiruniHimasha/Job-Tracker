// services/api.js
import axios from 'axios';

// In dev, falls back to your local backend.
// In production (Netlify), set VITE_API_URL in Site settings → Environment variables.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);
export const getMe    = ()     => API.get('/auth/me');

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
export const getApplications   = (params)     => API.get('/applications', { params });
export const getApplication    = (id)         => API.get(`/applications/${id}`);
export const createApplication = (data)       => API.post('/applications', data);
export const updateApplication = (id, data)   => API.put(`/applications/${id}`, data);
export const deleteApplication = (id)         => API.delete(`/applications/${id}`);

// ── AI ────────────────────────────────────────────────────────────────────────
export const generateCoverLetter = (data) => API.post('/ai/cover-letter', data);
export const analyzeJob          = (data) => API.post('/ai/analyze-job', data);

// ── JOB SUGGESTIONS ──────────────────────────────────────────────────────────
export const getJobSuggestions = (data) => API.post('/suggestions/generate', data);
