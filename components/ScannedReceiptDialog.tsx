import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Calendar, Hash, ShoppingBag, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ReceiptData {
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

interface ScannedReceiptDialogProps {
  receiptData: ReceiptData;
  onClose: () => void;
  onSaveReceipt?: (receipt: ReceiptData) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ScannedReceiptDialog({ 
  receiptData, 
  onClose, 
  onSaveReceipt 
}: ScannedReceiptDialogProps) {
  
  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveReceipt = () => {
    triggerHapticFeedback();
    onSaveReceipt?.(receiptData);
    onClose();
  };

  const handleIgnore = () => {
    triggerHapticFeedback();
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleIgnore}
            activeOpacity={0.7}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Image
                    source={require('../assets/images/receipt.png')} 
                    style={styles.receiptIcon}
                    resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>Receipt Scanned</Text>

              <View style={styles.receiptDetails}>
                {/* Transaction ID */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Hash size={16} color="#666" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Transaction ID</Text>
                    <Text style={styles.detailValue}>{receiptData.txnId}</Text>
                  </View>
                </View>

                {/* Date */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Calendar size={16} color="#666" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>{formatDate(receiptData.date)}</Text>
                  </View>
                </View>

                {/* Store Name */}
                {receiptData.storeName && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <ShoppingBag size={16} color="#666" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Store</Text>
                      <Text style={styles.detailValue}>{receiptData.storeName}</Text>
                    </View>
                  </View>
                )}

                {/* Payment Momo reference */}
                {receiptData.paymentReference && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <CreditCard size={16} color="#666" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Payment</Text>
                      <Text style={styles.detailValue}>{receiptData.paymentReference}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items Purchased</Text>
                  <Text style={styles.summaryValue}>{receiptData.itemCount}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    UGX {receiptData.totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Items List (if available) */}
              {receiptData.items && receiptData.items.length > 0 && (
                <View style={styles.itemsContainer}>
                  <Text style={styles.itemsTitle}>Items</Text>
                  {receiptData.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemQuantity}>
                          Qty: {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        UGX {item.price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.promptText}>
                Would you like to save this receipt to your records?
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.ignoreButton}
                  onPress={handleIgnore}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ignoreButtonText}>
                    Ignore
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveReceipt}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>
                    Save Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: Math.min(screenWidth - 40, 380),
    maxWidth: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollView: {
    maxHeight: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  receiptIcon: {
    width: 48,
    height: 48,
    tintColor: '#007AFF', 
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  receiptDetails: {
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#007AFF',
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  itemsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  ignoreButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
});