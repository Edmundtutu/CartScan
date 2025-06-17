import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

interface ReceiptData {
  transactionId: string;
  amount: number;
  currency: string;
  merchantName: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

interface QrCodeDialogBoxProps {
  visible: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
}

const QrCodeDialogBox = ({ visible, onClose, receiptData }: QrCodeDialogBoxProps) => {
  // Simplified QR data
  const receiptQRData = JSON.stringify({
    id: receiptData.transactionId,
    amount: receiptData.amount,
    merchant: receiptData.merchantName,
    total: `${receiptData.currency} ${receiptData.amount.toFixed(2)}`
  });

  const handleShare = async () => {
    try {
      const message = `Receipt from ${receiptData.merchantName}
Transaction ID: ${receiptData.transactionId}
Total: ${receiptData.currency} ${receiptData.amount.toFixed(2)}
Payment: ${receiptData.paymentMethod}`;

      await Share.share({
        message,
        title: 'Payment Receipt',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment Receipt</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Success Section */}
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>
            <Text style={styles.successText}>Payment Successful!</Text>
          </View>

          {/* Main Content - No ScrollView */}
          <View style={styles.content}>
            {/* Basic Receipt Info */}
            <View style={styles.basicInfo}>
              <Text style={styles.merchantName}>{receiptData.merchantName}</Text>
              <Text style={styles.amount}>
                {receiptData.currency} {receiptData.amount.toFixed(2)}
              </Text>
              <Text style={styles.transactionId}>
                ID: {receiptData.transactionId}
              </Text>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <QRCode
                value={receiptQRData}
                size={160}
                backgroundColor="white"
                color="black"
              />
              <Text style={styles.qrDescription}>
                Scan QR code to share receipt
              </Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={styles.shareButtonText}>Share Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width - 40,
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F0F9F0',
  },
  successIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 12,
    color: '#999',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    width: '100%',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QrCodeDialogBox;