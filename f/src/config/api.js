export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD 
    ? 'https://npmfr.onrender.com/api'
    : 'http://localhost:4000/api'
};