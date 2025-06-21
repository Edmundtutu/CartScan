import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'https://b067-129-205-3-100.ngrok-free.app/', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
