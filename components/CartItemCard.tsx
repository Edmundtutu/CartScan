import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { CartItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { dispatch } = useCart();
  const [translateX] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(1));

  const handleSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < -120) {
        // Swiped left significantly, show delete confirmation
        showDeleteConfirmation();
      }
      
      // Reset position with smooth animation
      Animated.spring(translateX, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      translateX.setValue(Math.min(0, translationX)); // Only allow left swipe
    }
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: handleRemoveItem
        },
      ]
    );
  };

  const handleRemoveItem = () => {
    // Add a subtle animation before removing
    Animated.timing(cardScale, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      dispatch({ type: 'REMOVE_ITEM', payload: item.code });
    });
  };

  const incrementQuantity = () => {
    dispatch({ type: 'INCREMENT_QTY', payload: item.code });
  };

  const decrementQuantity = () => {
    if (item.quantity === 1) {
      showDeleteConfirmation();
    } else {
      dispatch({ type: 'DECREMENT_QTY', payload: item.code });
    }
  };

  const totalPrice = (item.price * item.quantity).toFixed(2); // Format price for UGX

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipe}>
      <Animated.View 
        style={[
          styles.container,
          { 
            transform: [
              { translateX },
              { scale: cardScale }
            ] 
          }
        ]}
      >
        <View style={styles.card}>
          {/* Product Image Section */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
            </View>
          </View>
          
          {/* Product Information Section */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={showDeleteConfirmation}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.productSerial}>
              SKU: {item.serial}
            </Text>
            
            {/* Price and Quantity Section */}            <View style={styles.bottomSection}>
              <View style={styles.priceSection}>
                <Text style={styles.unitPrice}>
                  UGX {item.price.toFixed(2)} each
                </Text>
                <Text style={styles.totalPrice}>
                  UGX {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, styles.decrementButton]} 
                  onPress={decrementQuantity}
                  activeOpacity={0.7}
                >
                  <Minus size={16} color="#007AFF" />
                </TouchableOpacity>
                
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>
                    {item.quantity}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, styles.incrementButton]} 
                  onPress={incrementQuantity}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator}>
          <Animated.View 
            style={[
              styles.swipeHint,
              {
                opacity: translateX.interpolate({
                  inputRange: [-100, -50, 0],
                  outputRange: [1, 0.7, 0],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          >
            <Trash2 size={16} color="#FF3B30" />
            <Text style={styles.swipeHintText}>Release to delete</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  quantityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  
  // Product Information
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  productSerial: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceSection: {
    flex: 1,
  },
  unitPrice: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  
  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  decrementButton: {
    marginRight: 2,
  },
  incrementButton: {
    marginLeft: 2,
  },
  quantityDisplay: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  
  // Delete Button
  deleteButton: {
    padding: 4,
    borderRadius: 8,
  },
  
  // Swipe Indicator
  swipeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  swipeHintText: {
    fontSize: 11,
    color: '#FF3B30',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 4,
  },
});