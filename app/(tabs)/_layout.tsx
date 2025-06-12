import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { QrCode, ShoppingCart, Plus } from 'lucide-react-native';
import CartIconBadge from '@/components/CartIconBadge';
import { useCart } from '@/context/CartContext';

function CartTabIcon({ size, color }: { size: number; color: string }) {
  const { totalItems } = useCart();
  
  return (
    <View style={styles.tabIconContainer}>
      <ShoppingCart size={size} color={color} />
      {totalItems > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>
            {totalItems > 99 ? '99+' : totalItems.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
          color: '#1a1a1a',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E5E7',
          paddingTop: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Scanner',
          headerTitle: 'QR & Barcode Scanner',
          headerRight: () => <CartIconBadge />,
          tabBarIcon: ({ size, color }) => (
            <QrCode size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          tabBarLabel: 'Add Item',
          headerTitle: 'Add New Item',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: 'Cart',
          headerTitle: 'Shopping Cart',
          tabBarIcon: ({ size, color }) => (
            <CartTabIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});