import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Trash2, CircleAlert as AlertCircle } from 'lucide-react-native';
import CartItemCard from '@/components/CartItemCard';
import QrCodeDialogBox from '@/components/QrCodeDialogBox';
import {receiptStorage} from '@/helpers/receiptStorageHelper';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types';
import { processCheckOut } from '@/services/api';
import { ReceiptData } from '@/components/QrCodeDialogBox';

export default function CartScreen() {
  const { state, dispatch, totalItems } = useCart();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Scroll-aware UI state
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);
  
  // Animation values for hiding/showing header only
  const headerOpacity = useRef(new Animated.Value(1)).current;

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
            setTimeout(() => {
              dispatch({ type: 'CLEAR_CART' });
              setIsDeleting(false);
            }, 300);
          }
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add some items to your cart first.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setIsProcessing(true);
    try {
      const transaction = await processCheckOut(state, '076397782'); // customer number will have to be dynamic
      
      const receiptDataObj = {
        transactionId: transaction.txd,
        amount: parseFloat(transaction.total_amount),
        currency: 'UGX',
        merchantName: 'Fresco Supermarket',
        date: transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : '',
        time: transaction.timestamp ? new Date(transaction.timestamp).toLocaleTimeString() : '',
        items: transaction.items.map((item: any) => ({
          name: item.item.name,
          quantity: item.quantity,
          price: parseFloat(item.unit_price)
        })),
        paymentMethod: transaction.payment_reference || 'Mobile Money'
      };
      
      setReceiptData(receiptDataObj);
      setShowReceipt(true);
    } catch (error) {
      console.error('Checkout Failed:', error);
      Alert.alert('Checkout Failed', 'Could not complete checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveReceipt = async (receipt: any) => {
    try {
      const result = await receiptStorage.saveReceipt(receipt);
      if (result.success) {
        Alert.alert('Success', 'Receipt saved successfully!');
      } else {
        Alert.alert('Error', `Failed to save receipt: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Unexpected error: ${error}`);
    }
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Animated.View
      style={[
        {
          opacity: isDeleting ? 0.5 : 1,
          transform: [{ scale: isDeleting ? 0.95 : 1 }]
        },
        // Add subtle scale animation during scrolling for premium feel
        isScrolling && {
          transform: [{ scale: 0.98 }]
        }
      ]}
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
        <Text style={styles.summaryTitle}>Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Text>
          <Text style={styles.summaryValue}>UGX {subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>UGX {total.toFixed(2)}</Text>
        </View>

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
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerOverlay,
        {
          opacity: headerOpacity,
        }
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
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
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  // Scroll indicator that appears during scrolling
  const renderScrollIndicator = () => (
    <Animated.View 
      style={[
        styles.scrollIndicator,
        {
          opacity: isScrolling ? 1 : 0,
        }
      ]}
    >
      <View style={styles.scrollBar} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && styles.androidContainer]}>
      {state.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Full Screen Cart List with Footer Component */}
          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            style={styles.fullScreenList}
            contentContainerStyle={styles.listContentContainer}
            ListFooterComponent={renderCartSummary}
            contentInsetAdjustmentBehavior="automatic"
            removeClippedSubviews={true}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={30}
            initialNumToRender={10}
            windowSize={15}
            decelerationRate="normal"
            scrollEventThrottle={8}
          />

          {/* Overlay Components */}
          {renderHeader()}
          {renderScrollIndicator()}

          {/* Loading indicator for checkout */}
          {isProcessing && (
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              justifyContent: 'center', alignItems: 'center', zIndex: 9999
            }}>
              <Text style={{ color: '#007AFF', fontSize: 18, fontWeight: 'bold' }}>Processing Checkout...</Text>
            </View>
          )}

          {receiptData && (
            <QrCodeDialogBox
              visible={showReceipt}
              onClose={() => {
                setShowReceipt(false);
                setReceiptData(null);
                dispatch({ type: 'CLEAR_CART' });
              }}
              receiptData={receiptData}
              onSaveReceipt={handleSaveReceipt}
            />
          )}
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
  androidContainer: {
    paddingTop: RNStatusBar.currentHeight || 0,
  },

  // Full Screen List (takes entire screen)
  fullScreenList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContentContainer: {
    paddingTop: 100, // Space for header overlay
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for home indicator
  },

  // Header Overlay (positioned absolutely)
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 231, 0.6)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:5,
    paddingVertical:5,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    marginLeft: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Scroll Indicator
  scrollIndicator: {
    position: 'absolute',
    right: 4,
    top: 120,
    bottom: 20,
    width: 3,
    zIndex: 999,
    justifyContent: 'center',
  },
  scrollBar: {
    backgroundColor: '#007AFF',
    height: 40,
    borderRadius: 2,
    opacity: 0.6,
  },

  // Empty State (centered in full screen)
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

  // Summary Styles (now inline with list)
  summaryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 0,
    marginTop: 20,
    marginBottom: 20,
    padding: 8,
    borderRadius: 0,
    elevation: 0,
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
    backgroundColor: 'rgba(229, 229, 231, 0.8)',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },

  // Checkout Button (now part of summary)
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
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