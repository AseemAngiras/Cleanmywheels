
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'flex' }
    });
  }, [navigation]);

  return (

    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

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
            <Text style={styles.heroTitle}>Make Your{'\n'}Car Shine.</Text>
            <Text style={styles.heroSubtitle}>
              Premium eco-friendly car wash{'\n'}service delivered right to your{'\n'}doorstep.
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/home/select-service')}>
                <Text style={styles.primaryButtonText}>BOOK SERVICE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)/home/scanner')}>
                <Ionicons name="scan-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>QR Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800', // Extra bold like the image
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
  },
  imageWrapper: {
    width: '100%',
    height: 340,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    // Add shadow to image container
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
  badgeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  newBadge: {
    backgroundColor: '#FFD700', // Or match the yellow/green roughly if needed, but 'NEW' is usually yellow
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  serviceBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
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
  primaryButton: {
    backgroundColor: '#ffeb69', // Secondary color confirmed in recent turns
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#ffeb69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});