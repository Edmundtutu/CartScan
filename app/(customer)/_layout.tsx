import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { QrCode, ShoppingCart, ArrowLeft, Receipt, List } from 'lucide-react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import CartIconBadge from '@/components/CartIconBadge';
import { useCart } from '@/context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  
  return (
    <TouchableOpacity
      style={[styles.backButton, { paddingTop: Math.max(insets.top, 8) }]}
      onPress={() => router.push('/')}
      activeOpacity={0.7}
    >
      <ArrowLeft size={20} color="#007AFF" />
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
}

export default function CustomerTabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: '#f8f9fa',
          height: Platform.OS === 'ios' ? 44 + insets.top : 56 + (RNStatusBar.currentHeight || 0)
        },
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
          paddingTop: Platform.OS === 'ios' ? 8 : 4,
          height: Platform.OS === 'ios' ? 90 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 4 : 2,
        },
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Scanner</Text>,
          headerTitle: 'Scanner',
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
      <Tabs.Screen
        name="saved-receipts"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Receipts</Text>,
          headerTitle: 'My Receipts',
          tabBarIcon: ({ size, color }) => <List size={size} color={color} />,
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
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});