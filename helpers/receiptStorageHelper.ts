import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ReceiptData {
  txnId: string;
  totalAmount: number;
  itemCount: number;
  date: string;
  storeName?: string;
  paymentReference?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface SavedReceipt extends ReceiptData {
  id: string;
  savedAt: string;
}

export interface ReceiptStorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Constants
const STORAGE_KEY = 'saved_receipts';

/**
 * Receipt Storage Helper Class
 * Handles all receipt storage operations with local storage
 */
class ReceiptStorageHelper {
  
  /**
   * Save a new receipt to local storage
   * @param receipt - The receipt data to save
   * @returns Promise with success status and saved receipt data
   */
  async saveReceipt(receipt: ReceiptData): Promise<ReceiptStorageResult<SavedReceipt>> {
    try {
      const existingReceipts = await this.getAllReceipts();
      
      if (!existingReceipts.success) {
        return {
          success: false,
          error: 'Failed to retrieve existing receipts'
        };
      }

      const newReceipt: SavedReceipt = {
        ...receipt,
        id: this.generateReceiptId(),
        savedAt: new Date().toISOString()
      };

      const updatedReceipts = [...(existingReceipts.data || []), newReceipt];
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));
      
      return {
        success: true,
        data: newReceipt
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to save receipt: ${error}`
      };
    }
  }

  /**
   * Get all saved receipts from local storage
   * @returns Promise with success status and array of receipts
   */
  async getAllReceipts(): Promise<ReceiptStorageResult<SavedReceipt[]>> {
    try {
      const receiptsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      
      return {
        success: true,
        data: receipts
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to get receipts: ${error}`,
        data: []
      };
    }
  }

  /**
   * Get a specific receipt by ID
   * @param receiptId - The ID of the receipt to retrieve
   * @returns Promise with success status and receipt data
   */
  async getReceiptById(receiptId: string): Promise<ReceiptStorageResult<SavedReceipt>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts'
        };
      }

      const receipt = receiptsResult.data.find(r => r.id === receiptId);
      
      if (!receipt) {
        return {
          success: false,
          error: 'Receipt not found'
        };
      }

      return {
        success: true,
        data: receipt
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to get receipt: ${error}`
      };
    }
  }

  /**
   * Delete a specific receipt by ID
   * @param receiptId - The ID of the receipt to delete
   * @returns Promise with success status
   */
  async deleteReceipt(receiptId: string): Promise<ReceiptStorageResult<boolean>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts'
        };
      }

      const filteredReceipts = receiptsResult.data.filter(r => r.id !== receiptId);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReceipts));
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete receipt: ${error}`
      };
    }
  }

  /**
   * Update an existing receipt
   * @param receiptId - The ID of the receipt to update
   * @param updatedData - The updated receipt data
   * @returns Promise with success status and updated receipt
   */
  async updateReceipt(receiptId: string, updatedData: Partial<ReceiptData>): Promise<ReceiptStorageResult<SavedReceipt>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts'
        };
      }

      const receiptIndex = receiptsResult.data.findIndex(r => r.id === receiptId);
      
      if (receiptIndex === -1) {
        return {
          success: false,
          error: 'Receipt not found'
        };
      }

      const updatedReceipts = [...receiptsResult.data];
      updatedReceipts[receiptIndex] = {
        ...updatedReceipts[receiptIndex],
        ...updatedData
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));
      
      return {
        success: true,
        data: updatedReceipts[receiptIndex]
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to update receipt: ${error}`
      };
    }
  }

  /**
   * Get receipts filtered by date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Promise with success status and filtered receipts
   */
  async getReceiptsByDateRange(startDate: string, endDate: string): Promise<ReceiptStorageResult<SavedReceipt[]>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts'
        };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredReceipts = receiptsResult.data.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate >= start && receiptDate <= end;
      });

      return {
        success: true,
        data: filteredReceipts
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to filter receipts: ${error}`
      };
    }
  }

  /**
   * Get total spending amount from all receipts
   * @returns Promise with success status and total amount
   */
  async getTotalSpending(): Promise<ReceiptStorageResult<number>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts'
        };
      }

      const total = receiptsResult.data.reduce((sum, receipt) => sum + receipt.totalAmount, 0);

      return {
        success: true,
        data: total
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate total: ${error}`
      };
    }
  }

  /**
   * Clear all saved receipts (use with caution!)
   * @returns Promise with success status
   */
  async clearAllReceipts(): Promise<ReceiptStorageResult<boolean>> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear receipts: ${error}`
      };
    }
  }

  /**
   * Get receipts count
   * @returns Promise with success status and count
   */
  async getReceiptsCount(): Promise<ReceiptStorageResult<number>> {
    try {
      const receiptsResult = await this.getAllReceipts();
      
      if (!receiptsResult.success || !receiptsResult.data) {
        return {
          success: false,
          error: 'Failed to retrieve receipts',
          data: 0
        };
      }

      return {
        success: true,
        data: receiptsResult.data.length
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to get count: ${error}`,
        data: 0
      };
    }
  }

  /**
   * Generate a unique receipt ID
   * @returns Unique string ID
   */
  private generateReceiptId(): string {
    return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const receiptStorage = new ReceiptStorageHelper();

// Export the class for custom instances if needed
export default ReceiptStorageHelper;