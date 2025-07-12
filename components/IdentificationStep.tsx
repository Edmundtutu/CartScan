import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { QrCode, Zap, CheckCircle } from 'lucide-react-native';

interface IdentificationStepProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  error?: string;
}

const { width } = Dimensions.get('window');

const IdentificationStep: React.FC<IdentificationStepProps> = ({ 
  value, 
  onChange, 
  onScan, 
  error 
}) => {
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [scanAnimation] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  useEffect(() => {
    const scanAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimationLoop.start();
    return () => scanAnimationLoop.stop();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const scanOpacity = scanAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Animated.View style={[
      styles.card,
      {
        transform: [{ scale: scaleAnimation }],
      }
    ]}>
      {/* Header with icon */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Zap size={24} color="#4A90E2" />
        </View>
        <Text style={styles.title}>Item Identity</Text>
        <Text style={styles.subtitle}>Start by identifying your item</Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 4</Text>
      </View>

      <Text style={styles.label}>
        Serial Number
        {value ? <CheckCircle size={16} color="#10B981" style={styles.checkIcon} /> : null}
      </Text>

      <View style={styles.inputContainer}>
        <View style={[
          styles.inputWrapper,
          { 
            borderColor: isFocused ? '#4A90E2' : '#E2E8F0',
            backgroundColor: error ? '#FEF2F2' : '#F8FAFC'
          }
        ]}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter or scan serial number"
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={onScan}
          activeOpacity={0.8}
        >
          <Animated.View style={[
            styles.scanButtonContent,
            { opacity: scanOpacity }
          ]}>
            <QrCode size={24} color="#4A90E2" />
          </Animated.View>
          <View style={styles.scanRipple} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Success state */}
      {value && !error && (
        <View style={styles.successContainer}>
            <CheckCircle size={20} color="#10B981" />              
            <Text style={styles.successText}>Serial In Check</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 16,
    marginVertical: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 16,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  scanButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4A90E2',
    position: 'relative',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanRipple: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#10B981',
  },
  successText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default IdentificationStep;