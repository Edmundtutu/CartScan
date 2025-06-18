import { Product } from '@/types';
import { getItemBySerial } from './firebase';

// Updated to use Firebase instead of mock data
export async function fetchItemByCode(code: string): Promise<Product | null> {
  try {
    const item = await getItemBySerial(code);
    return item;
  } catch (error) {
    console.error('Error fetching item by code:', error);
    return null;
  }
}

// Function to fetch receipt data from server
export async function fetchReceiptByTransactionId(transactionId: string): Promise<any | null> {
  try {
    const response = await fetch(`http://localhost/swftmomo/api/receipts?txd=${transactionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const receiptData = await response.json();
    return receiptData;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return null;
  }
}

// Keep the random product function for demo purposes
// This will be replaced with Firebase data once items are added
export function getRandomProduct(): Product {  const mockProducts: Product[] = [
    {
      name: 'Tecno Camon 20',
      price: 899000, // Price in UGX
      image: 'https://images.pexels.com/photos/1042143/pexels-photo-1042143.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'TEC-CAM20-001',
    },
    {
      name: 'itel P40',
      price: 450000, // Price in UGX
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'ITL-P40-002',
    },
    {
      name: 'Infinix Hot 30',
      price: 750000, // Price in UGX
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'INF-HOT30-003',
    },
    {
      name: 'MTN MiFi Router',
      price: 120000, // Price in UGX
      image: 'https://images.pexels.com/photos/4218883/pexels-photo-4218883.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'MTN-MIFI-004',
    },
    {
      name: 'Airtel 4G Router',
      price: 115000, // Price in UGX
      image: 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'ATL-4GR-005',
    }
  ];

  return mockProducts[Math.floor(Math.random() * mockProducts.length)];
}