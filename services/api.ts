import { Product } from '@/types';
import { getItemBySerial } from './firebase';
import { createTransaction } from '@/api';

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
    const response = await fetch(`https://8401-129-205-3-103.ngrok-free.app/api/v1/transactions/${transactionId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const data = result.data;

    // Map API response to ReceiptData structure
    const receiptData = {
      txnId: data.txd,
      totalAmount: parseFloat(data.total_amount),
      itemCount: data.items.length,
      date: data.timestamp,
      storeName: undefined, // Not present in response
      paymentReference: data.payment_reference || data.payment_status || undefined,
      items: data.items.map((item: any) => ({
        name: item.item.name,
        quantity: item.quantity,
        price: parseFloat(item.unit_price),
      })),
    };

    return receiptData;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return null;
  }
}

// Function To Generate a Transaction to the Server.
export async function processCheckOut(cart: any, customerNumber = '0763977921') {
  // Prepare payload as per API documentation
  const payload = {
    txd: `TXD${Date.now()}`,
    customer_number: customerNumber,
    items: cart.items.map((item: any) => ({
      serial_no: item.code || item.serial, // fallback if serial is not present
      quantity: item.quantity,
      unit_price: item.price
    }))
  };

  console.log('Payload being sent to backend:', payload);

  try {
    const result = await createTransaction(payload);
    // result should contain the transaction data (see your API sample)
    return result.data; // or just result, depending on your API
  } catch (error) {
    throw error;
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

// Fetch item from the new server by serial number
export async function fetchServerItemBySerial(serial: string | number): Promise<any | null> {
  try {
    const response = await fetch(`https://8401-129-205-3-103.ngrok-free.app/api/v1/items/${serial}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching item from server:', error);
    return null;
  }
}