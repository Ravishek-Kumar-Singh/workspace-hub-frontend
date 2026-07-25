import axios from 'axios';

// Create a custom instance of Axios
const axiosInstance = axios.create({
    
    baseURL: 'https://workspace-hub-backend-zi39.onrender.com/api', // Your Spring Boot backend URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Look for the token in local storage
        const token = localStorage.getItem('token');
        
        // If the token exists, attach it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;