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

// Keep the random product function for demo purposes
// This will be replaced with Firebase data once items are added
export function getRandomProduct(): Product {
  const mockProducts: Product[] = [
    {
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'APL-IPH15P-001',
    },
    {
      name: 'Samsung Galaxy S24',
      price: 899.99,
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'SAM-GS24-002',
    },
    {
      name: 'MacBook Pro 14"',
      price: 1999.99,
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'APL-MBP14-003',
    },
  ];

  return mockProducts[Math.floor(Math.random() * mockProducts.length)];
}