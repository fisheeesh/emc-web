import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // window.location.href = '/login'
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
        return Promise.reject(error)
    }
)

export const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

export default api