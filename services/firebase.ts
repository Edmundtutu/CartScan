import { database } from '@/config/firebase';
import { ref, get, set, push, remove, onValue, off } from 'firebase/database';
import { Product } from '@/types';

export interface FirebaseProduct extends Product {
  id?: string;
}

// Function to fetch item details by serial number
export async function getItemBySerial(serialNumber: string): Promise<FirebaseProduct | null> {
  try {
    const itemRef = ref(database, `items/${serialNumber}`);
    const snapshot = await get(itemRef);

    if (snapshot.exists()) {
      const itemData = snapshot.val();
      console.log('Item found:', itemData);
      return {
        id: serialNumber,
        ...itemData
      };
    } else {
      console.log('No data available for serial:', serialNumber);
      return null;
    }
  } catch (error) {
    console.error('Error fetching item data:', error);
    throw error;
  }
}

// Function to add or update an item
export async function saveItem(serialNumber: string, itemData: Omit<Product, 'id'>): Promise<void> {
  try {
    const itemRef = ref(database, `items/${serialNumber}`);
    await set(itemRef, itemData);
    console.log('Item saved successfully!');
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
}

// Function to delete an item
export async function deleteItem(serialNumber: string): Promise<void> {
  try {
    const itemRef = ref(database, `items/${serialNumber}`);
    await remove(itemRef);
    console.log('Item deleted successfully!');
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

// Function to get all items
export async function getAllItems(): Promise<FirebaseProduct[]> {
  try {
    const itemsRef = ref(database, 'items');
    const snapshot = await get(itemsRef);

    if (snapshot.exists()) {
      const itemsData = snapshot.val();
      return Object.keys(itemsData).map(key => ({
        id: key,
        ...itemsData[key]
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching all items:', error);
    throw error;
  }
}

// Function to listen to real-time updates for all items
export function listenToItems(callback: (items: FirebaseProduct[]) => void): () => void {
  const itemsRef = ref(database, 'items');
  
  const unsubscribe = onValue(itemsRef, (snapshot) => {
    if (snapshot.exists()) {
      const itemsData = snapshot.val();
      const items = Object.keys(itemsData).map(key => ({
        id: key,
        ...itemsData[key]
      }));
      callback(items);
    } else {
      callback([]);
    }
  });

  // Return cleanup function
  return () => off(itemsRef, 'value', unsubscribe);
}

// Function to add sample data to Firebase (for testing)
export async function addSampleData(): Promise<void> {
  const sampleItems = {
    '123456789012': {
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'APL-IPH15P-001',
    },
    '234567890123': {
      name: 'Samsung Galaxy S24',
      price: 899.99,
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'SAM-GS24-002',
    },
    '345678901234': {
      name: 'MacBook Pro 14"',
      price: 1999.99,
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'APL-MBP14-003',
    },
    '456789012345': {
      name: 'Sony WH-1000XM5',
      price: 399.99,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'SNY-WH1000-004',
    },
    '567890123456': {
      name: 'iPad Air',
      price: 599.99,
      image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'APL-IPAD-005',
    },
    '678901234567': {
      name: 'Nintendo Switch',
      price: 299.99,
      image: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'NIN-NSW-006',
    },
    'qr-demo': {
      name: 'Demo Product (QR)',
      price: 29.99,
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=cover',
      serial: 'DEMO-QR-001',
    },
  };

  try {
    for (const [serialNumber, itemData] of Object.entries(sampleItems)) {
      await saveItem(serialNumber, itemData);
    }
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
}