import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Store, Users, Scan } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const handleCustomerPress = () => {
    router.push('/(customer)/scanner');
  };

  const handleVendorPress = () => {
    router.push('/(vendor)/scanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Scan size={48} color="#007AFF" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Cart Scan</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to use the app
          </Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleCard, styles.customerCard]}
            onPress={handleCustomerPress}
            activeOpacity={0.8}
          >
            <View style={styles.roleIconContainer}>
              <ShoppingCart size={40} color="#007AFF" strokeWidth={2} />
            </View>
            <Text style={styles.roleTitle}>I'm a Customer</Text>
            <Text style={styles.roleDescription}>
              Scan products and manage your shopping cart
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Scan QR codes & barcodes</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Manage shopping cart</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Generate receipts</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.vendorCard]}
            onPress={handleVendorPress}
            activeOpacity={0.8}
          >
            <View style={styles.roleIconContainer}>
              <Store size={40} color="#34C759" strokeWidth={2} />
            </View>
            <Text style={styles.roleTitle}>I'm a Vendor</Text>
            <Text style={styles.roleDescription}>
              Scan products and manage your inventory
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Scan QR codes & barcodes</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Add new products</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Manage inventory</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Users size={16} color="#8E8E93" />
          </View>
          <Text style={styles.footerText}>
            You can switch between roles anytime by returning to this screen
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  roleContainer: {
    flex: 1,
    gap: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 220,
  },
  customerCard: {
    borderColor: 'rgba(0, 122, 255, 0.1)',
    backgroundColor: 'rgba(0, 122, 255, 0.02)',
  },
  vendorCard: {
    borderColor: 'rgba(52, 199, 89, 0.1)',
    backgroundColor: 'rgba(52, 199, 89, 0.02)',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureBullet: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 8,
    width: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footerIcon: {
    marginRight: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    flex: 1,
    lineHeight: 18,
  },
});