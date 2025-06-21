import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { FlashlightOff as FlashOff, Slash as FlashOn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { fetchServerItemBySerial, fetchReceiptByTransactionId } from '@/services/api';
import { Product } from '@/types';
import { getApiConfig } from '@/config/api';

interface ScannerViewProps {
  onItemScanned?: (item: Product, code: string) => void;
  onReceiptScanned?: (receiptData: any, transactionId: string) => void;
}

export default function ScannerView({ onItemScanned, onReceiptScanned }: ScannerViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Handle focus and blur effects for camera state
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const initializeCamera = async () => {
        if (isActive) {
          setIsScanning(true);
          setIsLoading(false);
          setFlashOn(false);
        }
      };

      initializeCamera();

      return () => {
        isActive = false;
        setIsScanning(false);
        setIsLoading(false);
        setFlashOn(false);
      };
    }, [])
  );

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      // Only runs on iOS/Android
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Function to check if scanned data is a receipt URL
  const isReceiptUrl = (data: string): boolean => {
    try {
      const url = new URL(data);
      const apiConfig = getApiConfig();
      const baseUrl = new URL(apiConfig.API_SERVER_BASE_URL);
      return url.hostname === baseUrl.hostname &&
             url.pathname.includes('/api/v1/transactions')
    } catch {
      return false;
    }
  };

  // Function to extract transaction ID from receipt URL
  const extractTransactionId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      // Extract transaction ID from the path: /api/v1/transactions/TXD1750486067355
      const pathSegments = urlObj.pathname.split('/');
      const transactionId = pathSegments[pathSegments.length - 1]; // Get the last segment
      
      // Validate that it looks like a transaction ID (starts with TXD)
      if (transactionId && transactionId.startsWith('TXD')) {
        return transactionId;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (!isScanning || isLoading) return;

    setIsScanning(false);
    setIsLoading(true);

    try {
      // Check if the scanned data is a receipt URL
      if (isReceiptUrl(data)) {
        const transactionId = extractTransactionId(data);
        
        if (!transactionId) {
          Alert.alert(
            'Invalid Receipt URL',
            'The scanned QR code does not contain a valid transaction ID.',
            [
              { 
                text: 'Try Again', 
                onPress: () => setIsScanning(true)
              }
            ]
          );
          return;
        }

        const receiptData = await fetchReceiptByTransactionId(transactionId);
        
        if (receiptData) {
          // Trigger haptic feedback on successful scan
          triggerHapticFeedback();
          
          // Call the callback with the receipt data
          onReceiptScanned?.(receiptData, transactionId);
        } else {
          Alert.alert(
            'Receipt Not Found',
            `No receipt found for transaction ID: ${transactionId}`,
            [
              { 
                text: 'Try Again', 
                onPress: () => setIsScanning(true)
              }
            ]
          );
        }
      } else {
        // Handle as product code (server lookup)
        const product = await fetchServerItemBySerial(data);
        
        if (product) {
          // Trigger haptic feedback on successful scan
          triggerHapticFeedback();
          
          // Use a placeholder image if none is provided or if the image is empty
          const placeholderImage = require('../assets/images/product.png');
          let imageSource: any = placeholderImage;
          if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
            imageSource = { uri: product.image };
          }
          // Call the callback with the scanned item (adapted to Product type)
          onItemScanned?.({
            name: product.name,
            price: parseFloat(product.price),
            serial: String(product.serial_no),
            image: imageSource,
          }, String(product.serial_no));
        } else {
          Alert.alert(
            `Serial: ${data}`,
            'Product not found.',
            [
              { 
                text: 'Try Again', 
                onPress: () => setIsScanning(true)
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to fetch information. Please try again.',
        [
          { 
            text: 'Try Again', 
            onPress: () => setIsScanning(true)
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resumeScanning = () => {
    setIsScanning(true);
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          This app needs camera access to scan QR codes and barcodes.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8','code128']
        }}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        enableTorch={flashOn}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => setFlashOn(!flashOn)}
              activeOpacity={0.7}
            >
              {flashOn ? (
                <FlashOn size={24} color="white" />
              ) : (
                <FlashOff size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {!isScanning && !isLoading && (
                <View style={styles.scanPausedOverlay}>
                  <Text style={styles.scanPausedText}>Scanning Paused</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Looking up information...</Text>
              </View>
            ) : !isScanning ? (
              <TouchableOpacity 
                style={styles.resumeButton}
                onPress={resumeScanning}
                activeOpacity={0.8}
              >
                <Text style={styles.resumeButtonText}>Resume Scanning</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.instructionText}>
                Position the QR code or barcode within the frame
              </Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 24,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanPausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  scanPausedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  resumeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});