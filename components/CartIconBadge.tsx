import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/context/CartContext';
import { router } from 'expo-router';

export default function CartIconBadge() {
  const { totalItems } = useCart();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push('/(customer)/cart')}
      activeOpacity={0.7}
    >
      <ShoppingCart size={24} color="#007AFF" />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalItems > 99 ? '99+' : totalItems.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});