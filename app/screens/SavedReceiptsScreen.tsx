import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Receipt, Calendar, DollarSign, ShoppingBag, Trash2, Eye, Search, Filter, Download, Share2, MoveVertical as MoreVertical } from 'lucide-react-native';
import { receiptStorage, SavedReceipt } from '@/helpers/receiptStorageHelper';

const { width: screenWidth } = Dimensions.get('window');

export default function SavedReceiptsScreen() {
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<SavedReceipt | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [totalSpending, setTotalSpending] = useState(0);

  // Load receipts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const result = await receiptStorage.getAllReceipts();
      if (result.success && result.data) {
        // Sort by date (newest first)
        const sortedReceipts = result.data.sort((a, b) => 
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        setReceipts(sortedReceipts);
        
        // Calculate total spending
        const total = sortedReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
        setTotalSpending(total);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      Alert.alert('Error', 'Failed to load saved receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleDeleteReceipt = (receipt: SavedReceipt) => {
    Alert.alert(
      'Delete Receipt',
      `Are you sure you want to delete receipt ${receipt.txnId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await receiptStorage.deleteReceipt(receipt.id);
              if (result.success) {
                await loadReceipts();
                Alert.alert('Success', 'Receipt deleted successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete receipt');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipt');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (receipt: SavedReceipt) => {
    setSelectedReceipt(receipt);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const renderReceiptCard = ({ item }: { item: SavedReceipt }) => (
    <TouchableOpacity 
      style={styles.receiptCard}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.receiptIcon}>
          <Receipt size={20} color="#34C759" />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.transactionId} numberOfLines={1}>
            {item.txnId}
          </Text>
          <Text style={styles.savedDate}>
            Saved {formatDate(item.savedAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleDeleteReceipt(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.receiptDetails}>
          <View style={styles.detailRow}>
            <Calendar size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.date)}
            </Text>
          </View>
          
          {item.storeName && (
            <View style={styles.detailRow}>
              <ShoppingBag size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.storeName}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.itemCount}>
              {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
      </View>

      {item.paymentReference && (
        <View style={styles.paymentReference}>
          <Text style={styles.paymentText} numberOfLines={1}>
            Payment: {item.paymentReference}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{receipts.length}</Text>
          <Text style={styles.statLabel}>Saved Receipts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(totalSpending)}</Text>
          <Text style={styles.statLabel}>Total Spending</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Receipt size={80} color="#E5E5E7" strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No Saved Receipts</Text>
      <Text style={styles.emptyText}>
        Scan receipt QR codes to save them here for future reference
      </Text>
    </View>
  );

  const renderReceiptDetails = () => {
    if (!selectedReceipt) return null;

    return (
      <View style={styles.detailsOverlay}>
        <View style={styles.detailsModal}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Receipt Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Transaction ID</Text>
              <Text style={styles.detailsValue}>{selectedReceipt.txnId}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Date</Text>
              <Text style={styles.detailsValue}>{formatDate(selectedReceipt.date)}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Total Amount</Text>
              <Text style={[styles.detailsValue, styles.amountValue]}>
                {formatCurrency(selectedReceipt.totalAmount)}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Items</Text>
              <Text style={styles.detailsValue}>{selectedReceipt.itemCount}</Text>
            </View>

            {selectedReceipt.storeName && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Store</Text>
                <Text style={styles.detailsValue}>{selectedReceipt.storeName}</Text>
              </View>
            )}

            {selectedReceipt.paymentReference && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Payment</Text>
                <Text style={styles.detailsValue}>{selectedReceipt.paymentReference}</Text>
              </View>
            )}

            {selectedReceipt.items && selectedReceipt.items.length > 0 && (
              <View style={styles.itemsSection}>
                <Text style={styles.itemsSectionTitle}>Items Purchased</Text>
                {selectedReceipt.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQuantity}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <FlatList
        data={receipts}
        renderItem={renderReceiptCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#34C759']}
            tintColor="#34C759"
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          receipts.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
      />

      {showDetails && renderReceiptDetails()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  savedDate: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  receiptDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  paymentReference: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
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
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  detailsContent: {
    padding: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  detailsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailsValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: '#34C759',
    fontSize: 16,
  },
  itemsSection: {
    marginTop: 20,
  },
  itemsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});