import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import React from 'react';
import { Image, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' },
     });
    }, []);

    const params = useLocalSearchParams();
    const { shopName, shopImage, shopAddress, shopRating, date, time, shopLat, shopLong } = params;

    // Generate a random token number for demo
    const tokenNumber = Math.floor(100 + Math.random() * 900);

    const handleNavigate = () => {
        const lat = shopLat;
        const lng = shopLong;
        const label = (shopName as string) || 'Service Station';

        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;

        let url: string = '';
        if (lat && lng) {
            url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`
            }) as string;
        } else {
            const query = shopAddress || shopName;
            url = Platform.select({
                ios: `maps:0,0?q=${query}`,
                android: `geo:0,0?q=${query}`
            }) as string;
        }

        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100, alignItems: 'center', paddingTop: 40 }}>

                {/* Header */}
                <Text style={styles.headerTitle}>Order Confirmation</Text>

                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark" size={40} color="#fff" />
                </View>

                <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
                <Text style={styles.confirmedSubtitle}>Your slot has been secured.</Text>

                {/* Token Card */}
                <View style={styles.tokenCard}>
                    <View style={styles.tokenHeaderBorder} />
                    <Text style={styles.tokenLabel}>YOUR TOKEN NUMBER</Text>
                    <Text style={styles.tokenText}>#TOKEN-{tokenNumber}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.tokenInstruction}>Please show this to the station manager.</Text>

                    {/* Decorative notches */}
                    <View style={[styles.notch, styles.notchLeft]} />
                    <View style={[styles.notch, styles.notchRight]} />
                </View>

                {/* Station Details Header */}
                <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 10 }}>
                    <Text style={styles.sectionTitle}>Station Details</Text>
                </View>

                {/* Station Card */}
                <View style={styles.stationCard}>
                    <Image
                        source={{ uri: shopImage as string || 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }}
                        style={styles.stationImage}
                    />
                    <View style={styles.stationInfo}>
                        <Text style={styles.stationName}>{shopName || 'Speedy Wash Station'}</Text>
                        <Text style={styles.stationAddress} numberOfLines={2}>
                            {shopAddress as string || '123 Main St, Downtown'}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButtonOutline}>
                        <Ionicons name="call" size={18} color="#1a472a" />
                        <Text style={styles.actionButtonText}>Call Shop</Text>
                    </TouchableOpacity>

                    <View style={{ width: 15 }} />

                    <TouchableOpacity style={styles.actionButtonOutline} onPress={handleNavigate}>
                        <Ionicons name="navigate" size={18} color="#1a472a" />
                        <Text style={styles.actionButtonText}>Navigate</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => router.replace('/(tabs)/home')}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 30,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1a472a', // Dark Green as per image icon bg
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // Optional light ring effect
        borderWidth: 8,
        borderColor: '#e8f5e9',
    },
    confirmedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    confirmedSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 30,
    },

    // Token Card
    tokenCard: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 25,
        alignItems: 'center',
        marginBottom: 30,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    tokenHeaderBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#1a472a', // Top green border
    },
    tokenLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        marginBottom: 10,
        letterSpacing: 1,
        marginTop: 10,
    },
    tokenText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a472a',
        marginBottom: 20,
    },
    divider: {
        width: '80%',
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderRadius: 1,
    },
    tokenInstruction: {
        fontSize: 12,
        color: '#999',
    },
    notch: {
        position: 'absolute',
        top: '50%',
        width: 20,
        height: 20,
        backgroundColor: '#fdfdfd', // Match screen background
        borderRadius: 10,
        marginTop: -10,
    },
    notchLeft: { left: -10 },
    notchRight: { right: -10 },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    // Station Card
    stationCard: {
        flexDirection: 'row',
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    stationImage: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circle
        marginRight: 15,
    },
    stationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    stationAddress: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },

    // Buttons
    actionRow: {
        flexDirection: 'row',
        width: '90%',
        justifyContent: 'space-between',
    },
    actionButtonOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#ddeedd', // Light green border
        backgroundColor: '#f1f8f1', // Very light green bg
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1a472a',
    },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20,
        backgroundColor: '#fdfdfd',
    },
    homeButton: {
        backgroundColor: '#C8F000', // Secondary Yellow
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
});
