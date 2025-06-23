import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface ReviewStepProps {
  name: string;
  price: string;
  serial: string;
  image: string;
  onEdit: (step: number) => void;
  onSave: () => void;
  isLoading: boolean;
  error?: string;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ name, price, serial, image, onEdit, onSave, isLoading, error }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Review Item</Text>
    <View style={styles.row}><Text style={styles.label}>Serial:</Text><Text style={styles.value}>{serial}</Text><TouchableOpacity onPress={() => onEdit(0)}><Text style={styles.edit}>Edit</Text></TouchableOpacity></View>
    <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{name}</Text><TouchableOpacity onPress={() => onEdit(1)}><Text style={styles.edit}>Edit</Text></TouchableOpacity></View>
    <View style={styles.row}><Text style={styles.label}>Price:</Text><Text style={styles.value}>{price}</Text><TouchableOpacity onPress={() => onEdit(1)}><Text style={styles.edit}>Edit</Text></TouchableOpacity></View>
    <View style={styles.imagePreviewContainer}>
      {image ? <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" /> : <Text style={styles.noImage}>No image</Text>}
      <TouchableOpacity style={styles.editImageButton} onPress={() => onEdit(2)}><Text style={styles.edit}>Edit Image</Text></TouchableOpacity>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={isLoading}>
      {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveButtonText}>Save Item</Text>}
    </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    width: 80,
  },
  value: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  edit: {
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  noImage: {
    color: '#94A3B8',
    fontSize: 16,
    padding: 32,
  },
  editImageButton: {
    marginTop: 8,
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ReviewStep; 