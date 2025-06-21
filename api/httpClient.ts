import axios from 'axios';
import { getApiConfig } from '@/config/api';

const httpClient = axios.create({
  baseURL: getApiConfig().API_SERVER_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
