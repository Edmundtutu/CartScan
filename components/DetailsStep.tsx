import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface DetailsStepProps {
  name: string;
  price: string;
  onChange: (field: 'name' | 'price', value: string) => void;
  errors?: { name?: string; price?: string };
}

const DetailsStep: React.FC<DetailsStepProps> = ({ name, price, onChange, errors }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Details</Text>
    <Text style={styles.label}>Item Name</Text>
    <TextInput
      style={[styles.input, errors?.name && styles.inputError]}
      placeholder="Enter product name"
      value={name}
      onChangeText={value => onChange('name', value)}
    />
    {errors?.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
    <Text style={[styles.label, { marginTop: 20 }]}>Price (UGX)</Text>
    <TextInput
      style={[styles.input, errors?.price && styles.inputError]}
      placeholder="Enter price"
      value={price}
      onChangeText={value => onChange('price', value)}
      keyboardType="decimal-pad"
    />
    {errors?.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
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
});

export default DetailsStep; 