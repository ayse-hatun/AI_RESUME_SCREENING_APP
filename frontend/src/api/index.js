import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// Add token to requests
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Global Error Handler Interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status ?? 0;

        // Ensure error response structure exists for later parts
        if (!error.response) {
            error.response = { data: {} };
        }

        let friendlyMessage = null;

        // 1. Network Issues (Offline, connection refused)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            friendlyMessage = 'Unable to connect. Please check your internet connection and try again.';
        } 
        // 2. Timeout Issues
        else if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
            friendlyMessage = 'The request is taking too long due to a slow connection. Please try again.';
        }
        // 3. Server or Data Integrity Issues (e.g. data deleted manually)
        else if (status >= 500) {
            friendlyMessage = 'The server encountered an issue. Some data might be missing or temporarily unavailable.';
        } 
        else if (status === 404) {
            if (!error.response.data.error) {
                friendlyMessage = 'The requested data could not be found. It may have been deleted.';
            }
        }

        // Apply the friendly message consistently
        if (friendlyMessage) {
            error.message = friendlyMessage;
            error.response.data.error = friendlyMessage;
        }

        return Promise.reject(error);
    }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const verifyEmail = (data) => API.post('/auth/verify-email', data);
export const fetchMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

export const fetchJobs = () => API.get('/jobs');
export const fetchJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

export const fetchResumes = () => API.get('/resumes');
export const fetchResumeById = (id) => API.get(`/resumes/${id}`);
export const updateResumeStage = (id, data) => API.patch(`/resumes/${id}/stage`, data);
export const deleteResume = (id) => API.delete(`/resumes/${id}`);
export const retryResume = (id) => API.post(`/resumes/${id}/retry`);
export const bulkUploadResumes = (formData) => API.post('/bulk-screen-resume', formData, {
    timeout: 60000 // 60 seconds timeout
});

export const fetchPublicJobs = () => API.get('/public/jobs');
export const fetchPublicJobById = (id) => API.get(`/public/jobs/${id}`);
export const applyPublic = (formData) => API.post('/public/apply', formData);

export const fetchSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);

export default API;
