import httpClient from './httpClient';
import endpoints from './endpoints';

// Create a transaction (checkout)
export async function createTransaction(payload: any) {
  const response = await httpClient.post(endpoints.postTranasctions, payload);
  return response.data;
} 