import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Animated, Platform } from 'react-native';
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
  const buttonScale = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const animateButtonPress = (pressed: boolean) => {
    Animated.spring(buttonScale, {
      toValue: pressed ? 0.95 : 1,
      useNativeDriver: true,
      tension: 200,
      friction: 20
    }).start();
  };

  const startLongPress = (action: () => void) => {
    longPressTimer.current = setTimeout(() => {
      action();
      // Continue the action every 100ms while pressed
      const intervalId = setInterval(action, 100);
      longPressTimer.current = intervalId;
    }, 100);
  };

  const stopLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const totalPrice = (item.price * item.quantity).toFixed(2); // Format price for UGX

  return (
    <PanGestureHandler
      activeOffsetX={-10}
      activeOffsetY={[-20, 20]} // Allow some vertical movement before failing
      onHandlerStateChange={handleSwipe}
    >
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            
            {/* Price and Quantity Section */}
            <View style={styles.bottomSection}>
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
                  onLongPress={() => startLongPress(decrementQuantity)}
                  onPressIn={() => animateButtonPress(true)}
                  onPressOut={() => {
                    animateButtonPress(false);
                    stopLongPress();
                  }}
                  activeOpacity={0.7}
                  delayPressIn={0}
                >
                  <Minus size={14} color="#007AFF" />
                </TouchableOpacity>
                
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>
                    {item.quantity}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, styles.incrementButton]} 
                  onPress={incrementQuantity}
                  onLongPress={() => startLongPress(incrementQuantity)}
                  onPressIn={() => animateButtonPress(true)}
                  onPressOut={() => {
                    animateButtonPress(false);
                    stopLongPress();
                  }}
                  activeOpacity={0.7}
                  delayPressIn={0}
                >
                  <Plus size={14} color="#007AFF" />
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
            <Trash2 size={14} color="#FF3B30" />
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
    marginVertical: 4, // Reduced from 6
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12, // Reduced from 16
    padding: 12, // Reduced from 16
    flexDirection: 'row',
    shadowColor: Platform.select({
      ios: '#000',
      android: '#000000'
    }),
    shadowOffset: {
      width: 0,
      height: 1, // Reduced shadow
    },
    shadowOpacity: 0.05, // Reduced shadow
    shadowRadius: 2, // Reduced shadow
    elevation: 1, // Reduced elevation
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    marginRight: 12, // Reduced from 16
  },
  image: {
    width: 60, // Reduced from 80
    height: 60, // Reduced from 80
    borderRadius: 10, // Reduced from 12
    backgroundColor: '#f8f9fa',
  },
  quantityBadge: {
    position: 'absolute',
    top: -4, // Reduced from -6
    right: -4, // Reduced from -6
    backgroundColor: '#007AFF',
    borderRadius: 10, // Reduced from 12
    minWidth: 20, // Reduced from 24
    height: 20, // Reduced from 24
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  quantityBadgeText: {
    color: 'white',
    fontSize: 11, // Reduced from 12
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
    marginBottom: 4, // Reduced from 8
  },
  productName: {
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
    lineHeight: 18, // Reduced from 20
  },
  
  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8, // Added margin top
  },
  priceSection: {
    flex: 1,
  },
  unitPrice: {
    fontSize: 11, // Reduced from 12
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 16, // Reduced from 18
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  
  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12, // Reduced from 16
    padding: 3, // Reduced from 4
  },
  quantityButton: {
    width: 32, // Reduced from 40
    height: 32, // Reduced from 40
    borderRadius: 10, // Reduced from 12
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 1, // Reduced shadow
    },
    shadowOpacity: 0.05, // Reduced shadow
    shadowRadius: 2, // Reduced shadow
    elevation: 1, // Reduced elevation
  },
  decrementButton: {
    marginRight: 2,
  },
  incrementButton: {
    marginLeft: 2,
  },
  quantityDisplay: {
    minWidth: 28, // Reduced from 32
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14, // Reduced from 16
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  
  deleteButton: {
    padding: 8, // Reduced from 12
    borderRadius: 6, // Reduced from 8
  },
  
  // Swipe Indicator
  swipeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80, // Reduced from 100
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    borderRadius: 16, // Reduced from 20
  },
  swipeHintText: {
    fontSize: 10, // Reduced from 11
    color: '#FF3B30',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 4,
  },
});