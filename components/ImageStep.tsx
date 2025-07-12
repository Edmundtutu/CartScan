import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { Camera, Image as ImageIcon, Link, X, CheckCircle, Upload } from 'lucide-react-native';

interface ImageStepProps {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onCapture: () => void;
  capturedImage: string | null;
  onRemoveImage: () => void;
  isUploading: boolean;
  error?: string;
}

const { width } = Dimensions.get('window');

const ImageStep: React.FC<ImageStepProps> = ({ 
  imageUrl, 
  onImageUrlChange, 
  onCapture, 
  capturedImage, 
  onRemoveImage, 
  isUploading, 
  error 
}) => {
  const [focusAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [uploadAnimation] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  const [imageLoadAnimation] = useState(new Animated.Value(0));

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
    if (isUploading) {
      Animated.loop(
        Animated.timing(uploadAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      uploadAnimation.stopAnimation();
      uploadAnimation.setValue(0);
    }
  }, [isUploading]);

  useEffect(() => {
    if (capturedImage) {
      Animated.spring(imageLoadAnimation, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      imageLoadAnimation.setValue(0);
    }
  }, [capturedImage]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnimation, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnimation, {
      toValue: 0,
      tension: 300,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#8B5CF6'],
  });

  const uploadRotation = uploadAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[
      styles.card,
      { transform: [{ scale: scaleAnimation }] }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <ImageIcon size={24} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>Add Image</Text>
        <Text style={styles.subtitle}>Show off your item</Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 4</Text>
      </View>

      {/* Image Actions */}
      <View style={styles.imageActions}>
        <TouchableOpacity 
          style={[styles.imageActionButton, isUploading && styles.buttonDisabled]} 
          onPress={onCapture} 
          disabled={isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <Animated.View style={{ transform: [{ rotate: uploadRotation }] }}>
              <Upload size={24} color="#8B5CF6" />
            </Animated.View>
          ) : (
            <Camera size={24} color="#8B5CF6" />
          )}
          <Text style={[styles.imageActionText, isUploading && styles.buttonTextDisabled]}>
            {isUploading ? 'Processing...' : 'Take Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* URL Input */}
      <Text style={styles.label}>
        Image URL
        {(imageUrl || capturedImage) && !error ? (
          <CheckCircle size={16} color="#10B981" style={styles.checkIcon} />
        ) : null}
      </Text>

      <Animated.View style={[
        styles.inputWrapper,
        { 
          borderColor: error ? '#EF4444' : borderColor,
          backgroundColor: error ? '#FEF2F2' : '#F8FAFC'
        }
      ]}>
        <View style={styles.inputIconContainer}>
          <Link size={20} color={isFocused ? '#8B5CF6' : '#94A3B8'} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Paste image URL here"
          placeholderTextColor="#94A3B8"
          value={imageUrl}
          onChangeText={onImageUrlChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          keyboardType="url"
        />
      </Animated.View>

      {error && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {/* Image Preview */}
      {capturedImage && (
        <Animated.View 
          style={[
            styles.imagePreviewContainer,
            { 
              transform: [
                { scale: imageLoadAnimation },
                { 
                  translateY: imageLoadAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }
              ],
              opacity: imageLoadAnimation,
            }
          ]}
        >
          <View style={styles.imageFrame}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.imagePreview} 
              resizeMode="cover" 
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={onRemoveImage}
                activeOpacity={0.8}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.imageCaption}>Tap to remove image</Text>
        </Animated.View>
      )}

      {/* Success state */}
      {(capturedImage || imageUrl) && !error && (
        <Animated.View style={styles.successContainer}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.successText}>
            {capturedImage ? 'Photo captured!' : 'Image URL added!'}
          </Text>
        </Animated.View>
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    minHeight: Platform.OS === 'ios' ? 500 : 450, // Ensure minimum height for scrolling
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  imageActions: {
    marginBottom: 24,
  },
  imageActionButton: {
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  imageActionText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  buttonTextDisabled: {
    color: '#94A3B8',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    minHeight: 56, // Ensure consistent height
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
    minHeight: 56, // Match wrapper height
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
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  imageFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  imagePreview: {
    width: width - 80,
    height: 240,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageCaption: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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

export default ImageStep;