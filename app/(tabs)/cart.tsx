import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Animated
} from 'react-native';
import { ShoppingBag, Trash2, AlertCircle } from 'lucide-react-native';
import CartItemCard from '@/components/CartItemCard';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types';

export default function CartScreen() {
  const { state, dispatch, totalItems } = useCart();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearCart = () => {
    if (state.items.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            // Add a small delay for visual feedback
            setTimeout(() => {
              dispatch({ type: 'CLEAR_CART' });
              setIsDeleting(false);
            }, 300);
          }
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert(
        'Empty Cart', 
        'Please add some items to your cart first.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const finalTotal = (state.total * 1.08).toFixed(2);
    
    Alert.alert(
      'Confirm Checkout',
      `Proceed with checkout for ${totalItems} ${totalItems === 1 ? 'item' : 'items'} totaling $${finalTotal}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Checkout not yet integrated',
              'Coming soon! payment processor.',
              [
                { 
                  text: 'Continue Shopping', 
                  onPress: () => dispatch({ type: 'CLEAR_CART' })
                }
              ]
            );
          }
        },
      ]
    );
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Animated.View
      style={{
        opacity: isDeleting ? 0.5 : 1,
        transform: [{ scale: isDeleting ? 0.95 : 1 }]
      }}
    >
      <CartItemCard item={item} />
    </Animated.View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ShoppingBag size={80} color="#E5E5E7" strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Start scanning QR codes and barcodes to add items to your cart!
      </Text>
      <View style={styles.emptyHint}>
        <AlertCircle size={16} color="#8E8E93" />
        <Text style={styles.emptyHintText}>
          Tip: Swipe left on items to delete them quickly
        </Text>
      </View>
    </View>
  );

  const renderCartSummary = () => {
    const subtotal = state.total;
    const tax = subtotal * 0.18; // will use this in the future
    const total = subtotal; //subtotal + tax;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Text>
          <Text style={styles.summaryValue}>UGX {subtotal.toFixed(2)}</Text> {/* Format subtotal for UGX */}
        </View>
        
        {/* <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (18%)</Text>
          <Text style={styles.summaryValue}>UGX {tax.toFixed(2)}</Text> 
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View> */}
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>UGX {total.toFixed(2)}</Text> {/* Format total for UGX */}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>In Your Cart</Text>
        <Text style={styles.headerSubtitle}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Text>
      </View>
      
      {state.items.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearCart}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color="#FF3B30" />
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {state.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {renderHeader()}

          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            // Optimize for swipe gestures
            scrollEnabled={true}
            bounces={true}
            overScrollMode="auto"
          />

          <View style={styles.footer}>
            {renderCartSummary()}
            
            <TouchableOpacity 
              style={[
                styles.checkoutButton,
                isDeleting && styles.checkoutButtonDisabled
              ]}
              onPress={handleCheckout}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <Text style={[
                styles.checkoutButtonText,
                isDeleting && styles.checkoutButtonTextDisabled
              ]}>
                {isDeleting ? 'Updating Cart...' : 'Proceed to Checkout'}
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
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // List Styles
  listContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  itemSeparator: {
    height: 4,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  emptyHintText: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  
  // Footer & Summary
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
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
  
  // Checkout Button
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
  checkoutButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  checkoutButtonTextDisabled: {
    color: '#8E8E93',
  },
});