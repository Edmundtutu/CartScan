import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { dispatch } = useCart();
  const translateX = new Animated.Value(0);

  const handleSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < -100) {
        // Swiped left significantly, show delete confirmation
        Alert.alert(
          'Remove Item',
          `Remove ${item.name} from cart?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Remove', 
              style: 'destructive',
              onPress: () => dispatch({ type: 'REMOVE_ITEM', payload: item.code })
            },
          ]
        );
      }
      
      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === State.ACTIVE) {
      // Update position during swipe
      const { translationX } = event.nativeEvent;
      translateX.setValue(Math.min(0, translationX)); // Only allow left swipe
    }
  };

  const incrementQuantity = () => {
    dispatch({ type: 'INCREMENT_QTY', payload: item.code });
  };

  const decrementQuantity = () => {
    if (item.quantity === 1) {
      Alert.alert(
        'Remove Item',
        `Remove ${item.name} from cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => dispatch({ type: 'REMOVE_ITEM', payload: item.code })
          },
        ]
      );
    } else {
      dispatch({ type: 'DECREMENT_QTY', payload: item.code });
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipe}>
      <Animated.View 
        style={[styles.container, { transform: [{ translateX }] }]}
      >
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          
          <View style={styles.content}>
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.serial}>
                {item.serial}
              </Text>
              <Text style={styles.price}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={decrementQuantity}
                activeOpacity={0.7}
              >
                <Minus size={16} color="#007AFF" />
              </TouchableOpacity>
              
              <Text style={styles.quantity}>
                {item.quantity}
              </Text>
              
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={incrementQuantity}
                activeOpacity={0.7}
              >
                <Plus size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: item.code })}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe left to delete</Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  serial: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  swipeHint: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    opacity: 0.5,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});