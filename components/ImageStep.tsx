import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';

interface ImageStepProps {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onCapture: () => void;
  capturedImage: string | null;
  onRemoveImage: () => void;
  isUploading: boolean;
  error?: string;
}

const ImageStep: React.FC<ImageStepProps> = ({ imageUrl, onImageUrlChange, onCapture, capturedImage, onRemoveImage, isUploading, error }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Image</Text>
    <View style={styles.imageActions}>
      <TouchableOpacity style={styles.imageActionButton} onPress={onCapture} disabled={isUploading}>
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
    <Text style={styles.label}>Image URL</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder="Paste image URL here"
      value={imageUrl}
      onChangeText={onImageUrlChange}
      autoCapitalize="none"
      keyboardType="url"
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    {capturedImage && (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: capturedImage }} style={styles.imagePreview} resizeMode="cover" />
        <TouchableOpacity style={styles.removeImageButton} onPress={onRemoveImage}>
          <Text style={styles.removeImageText}>✕</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
});

export default ImageStep; 