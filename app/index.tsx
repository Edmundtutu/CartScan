import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
  ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Store, Users, Scan } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const scaleValue = new Animated.Value(1);
  
  interface AnimationCallback {
    (): void;
  }

  const animatePress = (callback: AnimationCallback): void => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => callback());
  };

  const handleCustomerPress = () => {
    animatePress(() => router.push('/(customer)/scanner'));
  };

  const handleVendorPress = () => {
    animatePress(() => router.push('/(vendor)/scanner'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2670' }} 
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <View style={styles.overlay} />
        
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Scan size={48} color="white" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Cart Scan</Text>
            <Text style={styles.subtitle}>
              Choose your experience
            </Text>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.roleContainer}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={[styles.roleCard, styles.customerCard]}
                onPress={handleCustomerPress}
                activeOpacity={0.9}
              >
                <View style={styles.cardTop}>
                  <ShoppingCart size={32} color="white" strokeWidth={2} />
                  <Text style={styles.roleTitle}>I'm a Customer</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.roleDescription}>
                    Scan products and while shopping
                  </Text>
               
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Start shopping</Text>
                </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={[styles.roleCard, styles.vendorCard]}
                onPress={handleVendorPress}
                activeOpacity={0.9}
              >
                <View style={styles.cardTop}>
                  <Store size={32} color="white" strokeWidth={2} />
                  <Text style={styles.roleTitle}>I'm a Vendor</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.roleDescription}>
                    Verify receipts and manage inventory
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Manage store</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.bottomFooter}>
            <Users size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.bottomFooterText}>
              You can switch between roles anytime
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  roleContainer: {
    flex: 1,
    gap: 25,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  customerCard: {
    borderTopColor: '#007AFF',
  },
  vendorCard: {
    borderTopColor: '#34C759',
  },
  cardTop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  cardContent: {
    padding: 20,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  roleDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  featureText: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  cardFooter: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter-SemiBold',
  },
  bottomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    gap: 10,
  },
  bottomFooterText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});