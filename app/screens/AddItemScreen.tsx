import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Animated,
  BackHandler,
  Keyboard,
} from 'react-native';
import { 
  Package, 
  DollarSign, 
  Image as ImageIcon, 
  Hash, 
  Tally4,
  Plus, 
  Camera, 
  QrCode,
  Upload,
  FileSpreadsheet,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { createServerItem, fetchAllServerItems, bulkCreateServerItems } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadImageToS3 } from '@/helpers/UploadToAWsBucket.js';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import IdentificationStep from '@/components/IdentificationStep';
import DetailsStep from '@/components/DetailsStep';
import ImageStep from '@/components/ImageStep';
import ReviewStep from '@/components/ReviewStep';
import { router } from 'expo-router';
import Papa from 'papaparse';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STEPS = ['Identification', 'Details', 'Image', 'Review'];

interface FormData {
  name: string;
  price: string;
  image: string;
  serial: string;
}

type FocusableField = keyof FormData | null;

interface ItemData {
  name: string;
  price: number;
  image: string;
  serial: string;
}

interface DatabaseItem {
  id: string;
  name: string;
}

export default function AddItemScreen() {
  const [selectedAction, setSelectedAction] = useState<'add' | 'bulk' | 'view' | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    image: '',
    serial: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [focusedField, setFocusedField] = useState<FocusableField>(null);
  const [errors, setErrors] = useState<any>({});
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Keyboard awareness
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const navigationAnimation = useRef(new Animated.Value(1)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      Animated.parallel([
        Animated.timing(navigationAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      Animated.parallel([
        Animated.timing(navigationAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (currentStep = step) => {
    let stepErrors: any = {};
    if (currentStep === 0) {
      if (!formData.serial.trim()) stepErrors.serial = 'Serial Number is required';
    }
    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = 'Product Name is required';
      if (!formData.price.trim() || isNaN(parseFloat(formData.price))) stepErrors.price = 'Valid Price is required';
    }
    if (currentStep === 2) {
      if (!formData.image.trim()) stepErrors.image = 'Image URL is required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      const nextStep = Math.min(step + 1, STEPS.length - 1);
      setStep(nextStep);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: nextStep * SCREEN_WIDTH, animated: true });
      }, 10);
    }
  };
  const goBack = () => {
    const prevStep = Math.max(step - 1, 0);
    setStep(prevStep);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: prevStep * SCREEN_WIDTH, animated: true });
    }, 10);
  };
  const goToStep = (idx: number) => {
    setStep(idx);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
    }, 10);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep(2)) return;
    setIsLoading(true);
    try {
      const itemData = {
        serial_no: formData.serial.trim(),
        name: formData.name.trim(),
        category: 'General', //  to add a category field to the form
        price: parseFloat(formData.price),
      };
      await createServerItem(itemData);
      Alert.alert(
        'Success!',
        'Item has been added successfully.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({ name: '', price: '', image: '', serial: '' });
              setCapturedImage(null);
              setStep(0);
              setSelectedAction('add');
              setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: 0, animated: false });
              }, 10);
            },
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => setSelectedAction(null),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to server. Please try again.');
      console.error('Error adding item to server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewItems = async (): Promise<void> => {
    try {
      const items = await fetchAllServerItems();
      const itemsList = items.map((item: any) => `• ${item.name} (${item.serial_no})`).join('\n');
      Alert.alert(
        'Items',
        items.length > 0
          ? `Found ${items.length} items:\n\n${itemsList}`
          : 'No items found. Add some items first!'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch items.');
      console.error('Error fetching items from server:', error);
    }
  };

  const handleImageCapture = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImageUpload = async (imageUri: string): Promise<void> => {
    setIsUploading(true);
    try {
      const result = await uploadImageToS3(imageUri);
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image: result.url,
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image Please try again.');
      setCapturedImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (!permission) {
      const { status } = await requestPermission();
      return status === 'granted';
    }
    return permission.granted;
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult): void => {
    setShowScanner(false);
    setFormData(prev => ({
      ...prev,
      serial: data,
    }));
    setTimeout(() => {
      goToStep(0);
    }, 10);
  };

  const toggleScanner = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to scan barcodes.');
      return;
    }
    setShowScanner(!showScanner);
  };

  const handleBulkUpload = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        let items: any[] = [];
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const response = await fetch(file.uri);
          const csvText = await response.text();
          const parsed = Papa.parse(csvText, { header: true });
          items = parsed.data.map((row: any) => ({
            serial_no: row.serial_no || row.serial,
            name: row.name,
            category: row.category || 'General',
            price: parseFloat(row.price),
          }));
        } else {
          Alert.alert('Unsupported file type', 'Please select a CSV file.');
          return;
        }
        // Filter out invalid rows
        items = items.filter(item => item.serial_no && item.name && !isNaN(item.price));
        if (items.length === 0) {
          Alert.alert('No valid items found in file.');
          return;
        }
        setIsLoading(true);
        await bulkCreateServerItems(items);
        Alert.alert('Success!', `Bulk upload successful. ${items.length} items added to server.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process bulk upload.');
      console.error('Error in bulk upload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stepComponents = [
    <IdentificationStep
      key="identification"
      value={formData.serial}
      onChange={val => handleInputChange('serial', val)}
      onScan={toggleScanner}
      error={errors.serial}
    />,
    <DetailsStep
      key="details"
      name={formData.name}
      price={formData.price}
      onChange={handleInputChange}
      errors={{ name: errors.name, price: errors.price }}
    />,
    <ImageStep
      key="image"
      imageUrl={formData.image}
      onImageUrlChange={val => handleInputChange('image', val)}
      onCapture={handleImageCapture}
      capturedImage={capturedImage}
      onRemoveImage={() => {
        setCapturedImage(null);
        setFormData(prev => ({ ...prev, image: '' }));
      }}
      isUploading={isUploading}
      error={errors.image}
    />,
    <ReviewStep
      key="review"
      name={formData.name}
      price={formData.price}
      serial={formData.serial}
      image={formData.image}
      onEdit={goToStep}
      onSave={handleSubmit}
      isLoading={isLoading}
      error={errors.submit}
    />,
  ];

  useEffect(() => {
    if (!selectedAction) return;
    const onBackPress = () => {
      if (selectedAction === 'add') {
        setSelectedAction(null);
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedAction]);

  // Uploading overlay for bulk upload
  const renderUploadingOverlay = () => {
    if (isLoading && selectedAction === 'bulk') {
      return (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#1E293B', fontWeight: '600' }}>
              Uploading items, please wait...
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
          }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Serial Number</Text>
            <TouchableOpacity
              style={styles.closeScannerButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.closeScannerText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerInstructions}>
            Position the barcode within the frame
          </Text>
        </View>
      </View>
    );
  }

  if (!selectedAction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cardSelectionContainer}>
          <View style={styles.cardSelectionGrid}>
            <TouchableOpacity style={styles.cardButton} onPress={() => setSelectedAction('add')}>
              <View style={styles.cardIconContainer}>
                <Plus size={28} color="#4A90E2" />
              </View>
              <Text style={styles.cardButtonText}>Add Item</Text>
              <Text style={styles.cardButtonDescription}>Add a single item manually</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cardButton} onPress={handleBulkUpload}>
              <View style={styles.cardIconContainer}>
                <FileSpreadsheet size={28} color="#4A90E2" />
              </View>
              <Text style={styles.cardButtonText}>Bulk Upload</Text>
              <Text style={styles.cardButtonDescription}>Import multiple items from file</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cardButton} onPress={handleViewItems}>
              <View style={styles.cardIconContainer}>
                <Eye size={28} color="#4A90E2" />
              </View>
              <Text style={styles.cardButtonText}>View Items</Text>
              <Text style={styles.cardButtonDescription}>Browse all saved items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderUploadingOverlay()}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Content area - takes full screen */}
        <Animated.View style={[
          styles.contentContainer,
          {
            paddingBottom: contentAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, keyboardHeight * 0.3],
            }),
          }
        ]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row' }}
          >
            {stepComponents.map((Component, idx) => (
              <ScrollView 
                key={idx} 
                style={styles.stepContainer}
                contentContainerStyle={styles.stepContentContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
                {Component}
              </ScrollView>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Navigation Overlay - hides when keyboard is open */}
        <Animated.View style={[
          styles.navigationOverlay,
          {
            opacity: navigationAnimation,
            transform: [{
              translateY: navigationAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              })
            }]
          }
        ]}>
          <TouchableOpacity
            style={[styles.navArrow, step === 0 && styles.navArrowDisabled]}
            onPress={goBack}
            disabled={step === 0}
          >
            <ChevronLeft 
              size={32} 
              color={step === 0 ? '#CBD5E1' : '#64748B'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navArrow, step === STEPS.length - 1 && styles.navArrowDisabled]}
            onPress={goNext}
            disabled={step === STEPS.length - 1}
          >
            <ChevronRight 
              size={32} 
              color={step === STEPS.length - 1 ? '#CBD5E1' : '#64748B'} 
            />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Card Selection Screen
  cardSelectionContainer: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  cardSelectionGrid: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  cardButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardButtonText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardButtonDescription: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Content
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  stepContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Navigation Overlay
  navigationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 10,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navArrowDisabled: {
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    opacity: 0.5,
  },

  // Scanner (keeping original styles)
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeScannerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeScannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
  },
});