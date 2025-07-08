import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { QrCode, ShoppingCart, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import CartIconBadge from '@/components/CartIconBadge';
import { useCart } from '@/context/CartContext';

function CartTabIcon({ size, color }: { size: number; color: string }) {
  const { totalItems } = useCart();

  if (totalItems <= 0) {
    return <ShoppingCart size={size} color={color} />;
  }

  return (
    <View style={styles.tabIconContainer}>
      <ShoppingCart size={size} color={color} />
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>
          {totalItems > 99 ? '99+' : totalItems.toString()}
        </Text>
      </View>
    </View>
  );
}

function BackButton() {
  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => router.push('/')}
      activeOpacity={0.7}
    >
      <ArrowLeft size={20} color="#007AFF" />
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
}

export default function CustomerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#f8f9fa' },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
          color: '#1a1a1a',
        },
        headerLeft: () => <BackButton />,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E5E7',
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 8 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Scanner</Text>,
          headerTitle: 'QR & Barcode Scanner',
          headerRight: () => <CartIconBadge />,
          tabBarIcon: ({ size, color }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Cart</Text>,
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
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});