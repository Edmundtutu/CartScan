import React, { useState } from 'react';
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
} from 'react-native';
import { 
  Package, 
  DollarSign, 
  Image as ImageIcon, 
  Hash, 
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
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';

const { width } = Dimensions.get('window');

interface FormData {
  serialNumber: string;
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

export default function AddItemScreen(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    serialNumber: '',
    name: '',
    price: '',
    image: '',
    serial: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [focusedField, setFocusedField] = useState<FocusableField>(null);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.serialNumber.trim()) errors.push('Serial Number is required');
    if (!formData.name.trim()) errors.push('Product Name is required');
    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) errors.push('Valid Price is required');
    if (!formData.image.trim()) errors.push('Image URL is required');
    if (!formData.serial.trim()) errors.push('Product Serial is required');
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const itemData: ItemData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        serial: formData.serial.trim(),
      };

      await saveItem(formData.serialNumber.trim(), itemData);
      
      Alert.alert(
        'Success!',
        'Item has been added to the database successfully.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                serialNumber: '',
                name: '',
                price: '',
                image: '',
                serial: '',
              });
              setCapturedImage(null);
            },
          },
          {
            text: 'Done',
            style: 'default',
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
      const items: DatabaseItem[] = await getAllItems();
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
        Alert.alert('Success', 'Image uploaded successfully to AWS S3!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image to AWS S3. Please try again.');
      setCapturedImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult): void => {
    setShowScanner(false);
    setFormData(prev => ({
      ...prev,
      serialNumber: data,
    }));
    Alert.alert('Success', `Serial number scanned: ${data}`);
  };

  const toggleScanner = async (): Promise<void> => {
    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan barcodes.');
        return;
      }
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

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Add Product</Text>
              <Text style={styles.subtitle}>
                Create new product entries for your inventory
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Serial Number Input with Scanner */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Product Identification</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Hash size={18} color="#4A90E2" />
                  <Text style={styles.inputLabel}>Serial Number</Text>
                </View>
                <View style={styles.inputWithAction}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputWithButton,
                      focusedField === 'serialNumber' && styles.inputFocused
                    ]}
                    placeholder="Enter or scan serial number"
                    value={formData.serialNumber}
                    onChangeText={(value) => handleInputChange('serialNumber', value)}
                    onFocus={() => setFocusedField('serialNumber')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={toggleScanner}
                    activeOpacity={0.7}
                  >
                    <QrCode size={20} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Hash size={18} color="#4A90E2" />
                  <Text style={styles.inputLabel}>Product Serial</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'serial' && styles.inputFocused
                  ]}
                  placeholder="Internal product serial"
                  value={formData.serial}
                  onChangeText={(value) => handleInputChange('serial', value)}
                  onFocus={() => setFocusedField('serial')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Product Details */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Package size={18} color="#50C878" />
                  <Text style={styles.inputLabel}>Product Name</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'name' && styles.inputFocused
                  ]}
                  placeholder="Enter product name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <DollarSign size={18} color="#FF6B6B" />
                  <Text style={styles.inputLabel}>Price (UGX)</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'price' && styles.inputFocused
                  ]}
                  placeholder="Enter price"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Image Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Product Image</Text>
              
              <View style={styles.imageSection}>
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={handleImageCapture}
                    disabled={isUploading}
                    activeOpacity={0.7}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#4A90E2" />
                    ) : (
                      <>
                        <Camera size={20} color="#4A90E2" />
                        <Text style={styles.imageActionText}>Take Photo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ImageIcon size={18} color="#9B59B6" />
                    <Text style={styles.inputLabel}>Image URL</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'image' && styles.inputFocused
                    ]}
                    placeholder="Paste image URL here"
                    value={formData.image}
                    onChangeText={(value) => handleInputChange('image', value)}
                    onFocus={() => setFocusedField('image')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                {capturedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: capturedImage }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        setCapturedImage(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Plus size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Add Product</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBulkUpload}
                activeOpacity={0.8}
              >
                <FileSpreadsheet size={18} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Bulk Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewItems}
                activeOpacity={0.8}
              >
                <Eye size={18} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFocused: {
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOpacity: 0.2,
  },
  inputWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithButton: {
    flex: 1,
    marginRight: 12,
  },
  scanButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    marginTop: 8,
  },
  imageActions: {
    marginBottom: 20,
  },
  imageActionButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  imageActionText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Scanner styles
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
    width: width * 0.7,
    height: width * 0.7,
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