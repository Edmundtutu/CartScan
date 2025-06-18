import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://192.168.0.123:80', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
