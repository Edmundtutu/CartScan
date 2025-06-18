import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Info } from 'lucide-react-native';
import ScannerView from '@/components/ScannerView';
import ScannedItemDialog from '@/components/ScannedItemDialog';
import ScannedReceiptDialog from '@/components/ScannedReceiptDialog';
import { Product } from '@/types';

export default function ScannerScreen() {
  const [showInfo, setShowInfo] = useState(false);
  const [scannedItem, setScannedItem] = useState<Product | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [scannedReceipt, setScannedReceipt] = useState<any | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  
  // Animation values
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(0.8));
  const [fabScale] = useState(new Animated.Value(1));

  const handleItemScanned = (item: Product, code: string) => {
    setScannedItem(item);
    setScannedCode(code);
    // Clear any existing receipt data
    setScannedReceipt(null);
    setTransactionId('');
  };

  const handleReceiptScanned = (receiptData: any, txId: string) => {
    setScannedReceipt(receiptData);
    setTransactionId(txId);
    // Clear any existing item data
    setScannedItem(null);
    setScannedCode('');
  };

  const handleDialogClose = () => {
    setScannedItem(null);
    setScannedCode('');
    setScannedReceipt(null);
    setTransactionId('');
  };

  const handleSaveReceipt = (receipt: any) => {
    // Handle saving receipt to local storage or database
    console.log('Saving receipt:', receipt);
    // You can implement receipt saving logic here
  };

  const showInfoDialog = () => {
    setShowInfo(true);
    
    // Animate overlay and card appearance
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideInfoDialog = () => {
    // Animate overlay and card disappearance
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowInfo(false);
      // Reset scale for next animation
      cardScale.setValue(0.8);
    });
  };

  const handleFabPress = () => {
    // Add a small bounce animation to the FAB
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    showInfoDialog();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScannerView 
        onItemScanned={handleItemScanned} 
        onReceiptScanned={handleReceiptScanned}
      />
      
      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScale }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Info size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Info Overlay */}
      {showInfo && (
        <Animated.View 
          style={[
            styles.infoOverlay,
            {
              opacity: overlayOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={hideInfoDialog}
          />
          <Animated.View 
            style={[
              styles.infoCard,
              {
                transform: [{ scale: cardScale }]
              }
            ]}
          >
            <Text style={styles.infoTitle}>How to Scan</Text>
            <Text style={styles.infoText}>
              • Point your camera at a QR code or barcode{'\n'}
              • Keep the code within the frame{'\n'}
              • Wait for automatic detection{'\n'}
            </Text>
            
            <TouchableOpacity 
              style={styles.infoCloseButton}
              onPress={hideInfoDialog}
              activeOpacity={0.8}
            >
              <Text style={styles.infoCloseText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {scannedItem && (
        <ScannedItemDialog
          item={scannedItem}
          code={scannedCode}
          onClose={handleDialogClose}
        />
      )}

      {scannedReceipt && (
        <ScannedReceiptDialog
          receiptData={scannedReceipt}
          onClose={handleDialogClose}
          onSaveReceipt={handleSaveReceipt}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  // Floating Action Button Styles
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  // Info Overlay Styles
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2000,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  codeContainer: {
    marginBottom: 20,
  },
  infoCode: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    textAlign: 'center',
  },
  infoCloseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  infoCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});