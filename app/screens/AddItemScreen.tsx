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
  EyeOff
} from 'lucide-react-native';
import { saveItem, getAllItems } from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadImageToS3 } from '@/helpers/UploadToAWsBucket.js';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import IdentificationStep from '@/components/IdentificationStep';
import DetailsStep from '@/components/DetailsStep';
import ImageStep from '@/components/ImageStep';
import ReviewStep from '@/components/ReviewStep';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      const itemData: ItemData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        serial: formData.serial.trim(),
      };

      await saveItem(formData.serial.trim(), itemData);
      
      Alert.alert(
        'Success!',
        'Item has been added to the database successfully.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                name: '',
                price: '',
                image: '',
                serial: '',
              });
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
      Alert.alert('Error', 'Failed to add item. Please try again.');
      console.error('Error adding item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewItems = async (): Promise<void> => {
    try {
      const rawItems = await getAllItems();
      const items: DatabaseItem[] = rawItems
        .filter((item: any) => typeof item.id === 'string')
        .map((item: any) => ({
          id: item.id as string,
          name: item.name,
        }));
      const itemsList = items.map(item => `• ${item.name} (${item.id})`).join('\n');
      
      Alert.alert(
        'Items in Database',
        items.length > 0 
          ? `Found ${items.length} items:\n\n${itemsList}`
          : 'No items found in database. Add some items first!'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch items from database.');
      console.error('Error fetching items:', error);
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
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        Alert.alert(
          'File Selected',
          `Selected: ${result.assets[0].name}\n\nBulk upload functionality would process this file and add multiple items to the database.`,
          [{ text: 'OK' }]
        );
        // Here you would implement the actual bulk upload logic
        // parseExcelFile(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file. Please try again.');
      console.error('Error selecting file:', error);
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
          <Text style={styles.cardSelectionTitle}>What would you like to do?</Text>
          <View style={styles.cardSelectionRow}>
            <TouchableOpacity style={styles.cardButton} onPress={() => setSelectedAction('add')}>
              <Plus size={32} color="#4A90E2" />
              <Text style={styles.cardButtonText}>Add Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardButton} onPress={handleBulkUpload}>
              <FileSpreadsheet size={32} color="#4A90E2" />
              <Text style={styles.cardButtonText}>Bulk Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardButton} onPress={handleViewItems}>
              <Eye size={32} color="#4A90E2" />
              <Text style={styles.cardButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.stepperHeader}>
          {STEPS.map((label, idx) => (
            <View key={label} style={styles.stepIndicatorContainer}>
              <View style={[styles.stepCircle, step === idx && styles.stepCircleActive]} />
              {idx < STEPS.length - 1 && <View style={styles.stepLine} />}
            </View>
          ))}
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1 }}
        >
          {stepComponents.map((Component, idx) => (
            <View key={idx} style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center' }}>
              {Component}
            </View>
          ))}
        </ScrollView>
        <View style={styles.stepperNav}>
          {step > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={goBack}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < STEPS.length - 1 && (
            <TouchableOpacity style={styles.navButton} onPress={goNext}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cardSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardSelectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 32,
  },
  cardSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  cardButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 110,
  },
  cardButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepCircleActive: {
    backgroundColor: '#4A90E2',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepperNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    paddingTop: 8,
  },
  navButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
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