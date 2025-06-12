import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Info } from 'lucide-react-native';
import ScannerView from '@/components/ScannerView';
import ScannedItemDialog from '@/components/ScannedItemDialog';
import { Product } from '@/types';

export default function ScannerScreen() {
  const [showInfo, setShowInfo] = useState(false);
  const [scannedItem, setScannedItem] = useState<Product | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');

  const handleItemScanned = (item: Product, code: string) => {
    setScannedItem(item);
    setScannedCode(code);
  };

  const handleDialogClose = () => {
    setScannedItem(null);
    setScannedCode('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScannerView onItemScanned={handleItemScanned} />
      
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowInfo(!showInfo)}
          activeOpacity={0.7}
        >
          <Info size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <View style={styles.infoOverlay}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to Scan</Text>
            <Text style={styles.infoText}>
              • Point your camera at a QR code or barcode{'\n'}
              • Keep the code within the frame{'\n'}
              • Wait for automatic detection{'\n'}
              • Choose whether to add items to your cart
            </Text>
            <Text style={styles.infoSubtitle}>Demo Codes to Try:</Text>
            <Text style={styles.infoCode}>123456789012</Text>
            <Text style={styles.infoCode}>234567890123</Text>
            <Text style={styles.infoCode}>345678901234</Text>
            <Text style={styles.infoCode}>qr-demo</Text>
            <TouchableOpacity 
              style={styles.infoCloseButton}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.infoCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scannedItem && (
        <ScannedItemDialog
          item={scannedItem}
          code={scannedCode}
          onClose={handleDialogClose}
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
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  infoButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 24,
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 300,
    width: '100%',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoCode: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  infoCloseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});