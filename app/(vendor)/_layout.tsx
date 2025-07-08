import { Tabs } from 'expo-router';
import { Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { QrCode, Plus, ArrowLeft, Receipt } from 'lucide-react-native';
import { router } from 'expo-router';

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

export default function VendorTabLayout() {
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
        tabBarActiveTintColor: '#34C759',
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
        name="saved-receipts"
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Receipts</Text>,
          headerTitle: 'Saved Receipts',
          tabBarIcon: ({ size, color }) => <Receipt size={size} color={color} />,
        }}
      />
    </Tabs>
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