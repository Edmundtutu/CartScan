import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { QrCode } from 'lucide-react-native';

interface IdentificationStepProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  error?: string;
}

const IdentificationStep: React.FC<IdentificationStepProps> = ({ value, onChange, onScan, error }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Item Identity</Text>
    <Text style={styles.label}>Serial Number</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder="Enter or scan serial number"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.scanButton} onPress={onScan}>
        <QrCode size={20} color="#4A90E2" />
      </TouchableOpacity>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  scanButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
  },
});

export default IdentificationStep; 