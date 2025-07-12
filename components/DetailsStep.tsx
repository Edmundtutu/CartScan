import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Animated,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { FileText, DollarSign, CheckCircle, TrendingUp } from 'lucide-react-native';

interface DetailsStepProps {
  name: string;
  price: string;
  onChange: (field: 'name' | 'price', value: string) => void;
  errors?: { name?: string; price?: string };
}

const DetailsStep: React.FC<DetailsStepProps> = ({ 
  name, 
  price, 
  onChange, 
  errors 
}) => {
  const [nameAnimation] = useState(new Animated.Value(0));
  const [priceAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [nameFocused, setNameFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  useEffect(() => {
    if (errors?.name || errors?.price) {
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
  }, [errors]);

  const handleNameFocus = () => {
    setNameFocused(true);
    Animated.spring(nameAnimation, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handleNameBlur = () => {
    setNameFocused(false);
    Animated.spring(nameAnimation, {
      toValue: 0,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePriceFocus = () => {
    setPriceFocused(true);
    Animated.spring(priceAnimation, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePriceBlur = () => {
    setPriceFocused(false);
    Animated.spring(priceAnimation, {
      toValue: 0,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const nameBorderColor = nameAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#4A90E2'],
  });

  const priceBorderColor = priceAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#10B981'],
  });

  const formatPrice = (text: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    // Format with commas for thousands
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    onChange('price', formatted);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[
        styles.card,
        { transform: [{ scale: scaleAnimation }] }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FileText size={24} color="#4A90E2" />
          </View>
          <Text style={styles.title}>Item Details</Text>
          <Text style={styles.subtitle}>Tell us about your item</Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            Item Name 
            {name && !errors?.name ? (
              <CheckCircle size={16} color="#10B981" style={styles.checkIcon} />
            ) : null}
          </Text>
          <Animated.View style={[
            styles.inputWrapper,
            { 
              borderColor: errors?.name ? '#EF4444' : nameBorderColor,
              backgroundColor: errors?.name ? '#FEF2F2' : '#F8FAFC'
            }
          ]}>
            <View style={styles.inputIconContainer}>
              <FileText size={20} color={nameFocused ? '#4A90E2' : '#94A3B8'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={value => onChange('name', value)}
              onFocus={handleNameFocus}
              onBlur={handleNameBlur}
            />
          </Animated.View>
          {errors?.name && (
            <Animated.View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.name}</Text>
            </Animated.View>
          )}
        </View>

        {/* Price Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            Price 
            {price && !errors?.price ? (
              <CheckCircle size={16} color="#10B981" style={styles.checkIcon} />
            ) : null}
          </Text>
          <Animated.View style={[
            styles.inputWrapper,
            { 
              borderColor: errors?.price ? '#EF4444' : priceBorderColor,
              backgroundColor: errors?.price ? '#FEF2F2' : '#F8FAFC'
            }
          ]}>
            <View style={styles.inputIconContainer}>
              <Text style={[
                styles.currencySymbol, 
                { color: priceFocused ? '#10B981' : '#94A3B8' }
              ]}>
                UGX
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={price}
              onChangeText={handlePriceChange}
              onFocus={handlePriceFocus}
              onBlur={handlePriceBlur}
              keyboardType="decimal-pad"
            />
            <View style={styles.trendingIconContainer}>
              <TrendingUp size={20} color={priceFocused ? '#10B981' : '#94A3B8'} />
            </View>
          </Animated.View>
          {errors?.price && (
            <Animated.View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.price}</Text>
            </Animated.View>
          )}
        </View>
        {/* Completion indicator */}
        {name && price && !errors?.name && !errors?.price && (
          <Animated.View style={styles.successContainer}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.successText}>Details look great!</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
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
  inputSection: {
    marginBottom: 24,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  inputIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  trendingIconContainer: {
    marginLeft: 12,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
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

export default DetailsStep;