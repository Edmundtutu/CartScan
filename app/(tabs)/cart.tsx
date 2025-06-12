import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { ShoppingBag, Trash2 } from 'lucide-react-native';
import CartItemCard from '@/components/CartItemCard';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types';

export default function CartScreen() {
  const { state, dispatch, totalItems } = useCart();

  const handleClearCart = () => {
    if (state.items.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => dispatch({ type: 'CLEAR_CART' })
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart first.');
      return;
    }

    Alert.alert(
      'Checkout',
      `Proceed with checkout for ${totalItems} items totaling $${state.total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: () => {
            Alert.alert(
              'Success!',
              'This is a demo checkout. In a real app, this would integrate with a payment processor.',
              [
                { 
                  text: 'OK', 
                  onPress: () => dispatch({ type: 'CLEAR_CART' })
                }
              ]
            );
          }
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <CartItemCard item={item} />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <ShoppingBag size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Start scanning QR codes and barcodes to add items to your cart!
      </Text>
    </View>
  );

  const renderCartSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Items ({totalItems})</Text>
        <Text style={styles.summaryValue}>${state.total.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax</Text>
        <Text style={styles.summaryValue}>${(state.total * 0.08).toFixed(2)}</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${(state.total * 1.08).toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {state.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearCart}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#FF3B30" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.footer}>
            {renderCartSummary()}
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E7',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});