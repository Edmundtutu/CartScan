import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { ShoppingCart, X, Package } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface ScannedItemDialogProps {
  item: Product;
  code: string;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ScannedItemDialog({ item, code, onClose }: ScannedItemDialogProps) {
  const { dispatch } = useCart();

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddToCart = () => {
    triggerHapticFeedback();
    
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        code, 
        ...item 
      } 
    });
    
    onClose();
  };

  const handleIgnore = () => {
    triggerHapticFeedback();
    onClose();
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleIgnore}
            activeOpacity={0.7}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image 
                source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              
              <View style={styles.serialContainer}>
                <Package size={14} color="#666" />
                <Text style={styles.serial}>
                  {item.serial}
                </Text>
              </View>
              
              <Text style={styles.price}>
                {item?.price ? (
                  <Text style={styles.price}>UGX {item.price.toFixed(2)}</Text>
                ) : (
                  <Text style={styles.price}>Price Unavailable</Text>
                )}
              </Text>
            </View>

            <Text style={styles.promptText}>
              Would you like to add this item to your cart?
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.ignoreButton}
                onPress={handleIgnore}
                activeOpacity={0.8}
              >
                <Text style={styles.ignoreButtonText}>
                  Ignore
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddToCart}
                activeOpacity={0.8}
              >
                <ShoppingCart size={18} color="white" />
                <Text style={styles.addButtonText}>
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: Math.min(screenWidth - 40, 340),
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serial: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  ignoreButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
});