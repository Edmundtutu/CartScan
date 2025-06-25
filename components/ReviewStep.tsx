import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { 
  CheckCircle, 
  Edit3, 
  Save, 
  Eye, 
  Star,
  Hash,
  FileText,
  DollarSign,
  ImageIcon
} from 'lucide-react-native';

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

const { width } = Dimensions.get('window');

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  name, 
  price, 
  serial, 
  image, 
  onEdit, 
  onSave, 
  isLoading, 
  error 
}) => {
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [fadeAnimation] = useState(new Animated.Value(0));
  const [saveAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for save button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

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
    if (isLoading) {
      Animated.loop(
        Animated.timing(saveAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      saveAnimation.stopAnimation();
      saveAnimation.setValue(0);
    }
  }, [isLoading]);

  const formatPrice = (priceStr: string) => {
    return `UGX ${priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const saveRotation = saveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Animated.View style={[
        styles.card,
        { 
          transform: [{ scale: scaleAnimation }],
          opacity: fadeAnimation,
        }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Eye size={24} color="#10B981" />
          </View>
          <Text style={styles.title}>Review & Save</Text>
          <Text style={styles.subtitle}>Everything looks good?</Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4</Text>
        </View>

        {/* Item Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Star size={20} color="#F59E0B" />
            <Text style={styles.summaryTitle}>Item Summary</Text>
          </View>

          {/* Serial Number */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconContainer}>
                <Hash size={18} color="#4A90E2" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Serial Number</Text>
                <Text style={styles.detailValue}>{serial}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => onEdit(0)}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconContainer}>
                <FileText size={18} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Item Name</Text>
                <Text style={styles.detailValue}>{name}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => onEdit(1)}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconContainer}>
                <DollarSign size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={[styles.detailValue, styles.priceValue]}>
                  {formatPrice(price)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => onEdit(1)}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Preview */}
        <View style={styles.imageSection}>
          <View style={styles.imageSectionHeader}>
            <ImageIcon size={20} color="#64748B" />
            <Text style={styles.imageSectionTitle}>Item Image</Text>
            <TouchableOpacity 
              style={styles.editImageButton} 
              onPress={() => onEdit(2)}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color="#8B5CF6" />
              <Text style={styles.editImageText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            {image ? (
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview} 
                  resizeMode="cover" 
                />
                <View style={styles.imageOverlay}>
                  <CheckCircle size={24} color="#10B981" />
                </View>
              </View>
            ) : (
              <View style={styles.noImageContainer}>
                <ImageIcon size={48} color="#94A3B8" />
                <Text style={styles.noImageText}>No image added</Text>
                <Text style={styles.noImageSubtext}>Tap edit to add one</Text>
              </View>
            )}
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <Animated.View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Save Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonLoading]} 
            onPress={onSave} 
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={{ transform: [{ rotate: saveRotation }] }}>
                  <ActivityIndicator size="small" color="white" />
                </Animated.View>
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <View style={styles.saveContainer}>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Item</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 16,
    marginVertical: 24,
    shadowColor: '#10B981',
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
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10B981',
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
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '600',
  },
  priceValue: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
    marginLeft: 8,
  },
  editImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  editImageText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  imagePreview: {
    width: width - 80,
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    width: width - 80,
  },
  noImageText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 12,
  },
  noImageSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  saveButtonLoading: {
    backgroundColor: '#6B7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ReviewStep;