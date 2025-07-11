import { Tabs } from 'expo-router';
import { Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { QrCode, Plus, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function VendorTabLayout() {
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
        tabBarActiveTintColor: '#34C759',
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
          headerTitle: 'QR & Barcode Scanner',
          tabBarIcon: ({ size, color }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Add Item</Text>,
          headerTitle: 'Add New Item',
          tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
  )
  );
}

const styles = StyleSheet.create({
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