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
} from 'react-native';
import { Package, DollarSign, Image as ImageIcon, Hash, Plus, Database, Camera } from 'lucide-react-native';
import { saveItem, addSampleData, getAllItems } from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToS3 } from '@/helpers/UploadToAWsBucket';

export default function AddItemScreen() {
  const [formData, setFormData] = useState({
    serialNumber: '',
    name: '',
    price: '',
    image: '',
    serial: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.serialNumber.trim()) {
      Alert.alert('Validation Error', 'Serial Number is required');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product Name is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      Alert.alert('Validation Error', 'Valid Price is required');
      return false;
    }
    if (!formData.image.trim()) {
      Alert.alert('Validation Error', 'Image URL is required');
      return false;
    }
    if (!formData.serial.trim()) {
      Alert.alert('Validation Error', 'Product Serial is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const itemData = {
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

  const handleAddSampleData = async () => {
    setIsLoadingSample(true);
    try {
      await addSampleData();
      Alert.alert(
        'Sample Data Added!',
        'Sample products have been added to your Firebase database. You can now scan the following codes:\n\n• 123456789012\n• 234567890123\n• 345678901234\n• qr-demo'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add sample data. Please try again.');
      console.error('Error adding sample data:', error);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleViewItems = async () => {
    try {
      const items = await getAllItems();
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

  const handleImageCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImageUpload = async (imageUri: string) => {
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
            <Text style={styles.title}>Add New Product</Text>
            <Text style={styles.subtitle}>
              Add products to the database for scanning
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Hash size={20} color="#007AFF" />
                <Text style={styles.inputLabel}>Serial Number (Scan Code)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 123456789012"
                value={formData.serialNumber}
                onChangeText={(value) => handleInputChange('serialNumber', value)}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Package size={20} color="#007AFF" />
                <Text style={styles.inputLabel}>Product Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Bread"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                <DollarSign size={20} color="#007AFF" />
                <Text style={styles.inputLabel}>Price</Text>
                </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5000"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <ImageIcon size={20} color="#007AFF" />
                <Text style={styles.inputLabel}>Image</Text>
              </View>
              
              <View style={styles.imageOptions}>
                <TouchableOpacity
                  style={[styles.imageOption, styles.cameraButton]}
                  onPress={handleImageCapture}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <>
                      <Camera size={20} color="#007AFF" />
                      <Text style={styles.cameraButtonText}>Take Photo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.imageUrlContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Or enter image URL"
                    value={formData.image}
                    onChangeText={(value) => handleInputChange('image', value)}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {capturedImage && (
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: capturedImage }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Hash size={20} color="#007AFF" />
                <Text style={styles.inputLabel}>Product Serial</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.serial}
                onChangeText={(value) => handleInputChange('serial', value)}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text style={styles.submitButtonText}>Add Item to Database</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Actions</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.sampleButton]}
              onPress={handleAddSampleData}
              disabled={isLoadingSample}
              activeOpacity={0.8}
            >
              {isLoadingSample ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Database size={18} color="#007AFF" />
                  <Text style={styles.sampleButtonText}>Add Sample Data</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.viewButton]}
              onPress={handleViewItems}
              activeOpacity={0.8}
            >
              <Package size={18} color="#666" />
              <Text style={styles.viewButtonText}>View All Items</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Tips</Text>
            <Text style={styles.infoText}>
              • Use the Serial Number as the scan code{'\n'}
              • Image URLs from Pexels work great{'\n'}
              • Add sample data to test scanning{'\n'}
              • Items are stored in Firebase Realtime Database
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E7',
  },
  dividerText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sampleButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  sampleButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  viewButton: {
    backgroundColor: 'white',
    borderColor: '#E5E5E7',
  },
  viewButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  imageOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cameraButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  cameraButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  imageUrlContainer: {
    flex: 2,
  },
  previewContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
});