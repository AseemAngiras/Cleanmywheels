import { RootState } from '@/store';
import { Booking } from '@/store/slices/bookingSlice';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const bookings = useSelector((state: RootState) => state.bookings.bookings);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // Filter for completed bookings (or all if we want to show generic history).
  // Including address in dummy data as per requirement.
  const allBookings = bookings.length > 0 ? bookings : [
    {
      id: 'dummy-1',
      serviceName: 'Premium Wash',
      price: 499,
      car: 'Sedan - KA05 1234',
      date: '2023-10-10',
      center: 'Your Location',
      address: '123, Green Street, Bangalore',
      carImage: 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
      status: 'completed'
    },
    {
      id: 'dummy-2',
      serviceName: 'Interior Detail',
      price: 899,
      car: 'SUV - DL01 5678',
      date: '2023-11-05',
      center: 'Your Location',
      address: '456, Blue Avenue, Delhi',
      carImage: 'https://cdn-icons-png.flaticon.com/512/743/743007.png',
      status: 'completed'
    }
  ] as Partial<Booking>[];

  // Deduplicate bookings: maintain uniqueness by Service + Address + Car
  // We want to show the list of *unique* services the user has availed, 
  // effectively creating a "Favorites" or "Quick Rebook" list.
  const uniqueBookingsMap = new Map();

  allBookings.forEach((booking) => {
    // key = ServiceName | Address | Car
    const key = `${booking.serviceName}|${booking.address}|${booking.car}`;

    // If not present, add it.
    // If present, we could optionally update it if the new one is more recent,
    // but since we iterate usually in chronological order (or reverse), logic depends.
    // Assuming `bookings` from Redux might be appended, later items are newer.
    // So we just overwrite to ensure we have the latest instance (e.g. maybe price changed?).
    uniqueBookingsMap.set(key, booking);
  });

  // Convert map values back to array and reverse to show most recent first (if source was chronological)
  const pastBookings = Array.from(uniqueBookingsMap.values()).reverse();

  useFocusEffect(
    useCallback(() => {
      // Ensure tab bar is visible when on Home root
      const homeStack = navigation.getParent();
      const tabs = homeStack?.getParent();

      if (tabs) {
        tabs.setOptions({
          tabBarStyle: { display: 'flex' }
        });
      }
    }, [navigation])
  );

  const handleRecentServicePress = (booking: Partial<Booking>) => {
    // Navigate to Select Slot (Step 2) instead of Summary
    // We pass necessary details so the user just picks a time
    router.push({
      pathname: '/(tabs)/home/book-doorstep/select-slot',
      params: {
        serviceName: booking.serviceName,
        shopName: booking.center || 'Your Location',
        basePrice: booking.price,
        // Pass address and vehicle info to pre-fill or context
        address: booking.address,
        vehicleType: booking.car?.split(' - ')[0] || 'Sedan',
        vehicleNumber: booking.car?.split(' - ')[1] || '',
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Cleanmywheels</Text>
            <Text style={styles.greeting}>Hi, John Doe</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Make Your Car Shine.</Text>
            <Text style={styles.heroSubtitle}>
              Premium eco-friendly car wash service{'\n'}delivered right to your doorstep.
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.bookDoorstepButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/home/book-doorstep/enter-location')}
              >
                <Ionicons name="home" size={22} color="#1a1a1a" style={{ marginRight: 10 }} />
                <Text style={styles.bookDoorstepButtonText}>Book Doorstep</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Services Section */}
        {isLoggedIn && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
              {pastBookings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  onPress={() => handleRecentServicePress(item)}
                >
                  <View style={styles.recentIconContainer}>
                    <Ionicons name="sparkles" size={24} color="#84c95c" />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentServiceName}>{item.serviceName}</Text>
                    {/* Display Address */}
                    {item.address && (
                      <Text style={styles.recentAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    )}
                    <Text style={styles.recentCarText}>{item.car}</Text>
                    <View style={styles.recentPriceRow}>
                      <Text style={styles.recentPrice}>₹{item.price}</Text>
                      <View style={styles.rebookBadge}>
                        <Text style={styles.rebookText}>Rebook</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  greeting: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 4,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  bookDoorstepButton: {
    backgroundColor: '#C8F000',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 40,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8F000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bookDoorstepButtonText: {
    color: '#1a1a1a',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Recent Services Styles
  recentSection: {
    marginTop: 0,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  recentList: {
    paddingRight: 20,
  },
  recentCard: {
    backgroundColor: '#fff',
    width: 250,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recentInfo: {
    flex: 1,
  },
  recentServiceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  recentAddress: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
  },
  recentCarText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  rebookBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rebookText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});