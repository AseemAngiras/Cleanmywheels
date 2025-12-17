
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function ShopsListScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    // Login Logic States
    const [isLoading, setIsLoading] = useState(false);
    const [modalStep, setModalStep] = useState<'details' | 'otp'>('details');
    const [otp, setOtp] = useState(['', '', '', '']);

    // Mock Data
    const allShops = [
        {
            id: '1',
            name: 'Sparkle Station Main St.',
            rating: 4.8,
            distance: '1.2km away',
            slots: '3 slots available',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c'
        },
        {
            id: '2',
            name: 'GlowWash Downtown',
            rating: 4.5,
            distance: '2.5km away',
            slots: '2-3 slots available',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c'
        },
        {
            id: '3',
            name: 'Sunny Side Wash',
            rating: 4.2,
            distance: '3.0km away',
            slots: '1 slot left',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#ffe5d4', // Orange-ish for low slots
            slotsTextColor: '#ff7f50'
        },
        {
            id: '4',
            name: 'Blue Wave Auto',
            rating: 4.9,
            distance: '0.8km away',
            slots: '5+ slots available',
            price: 30.00,
            image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c'
        },
    ];

    const filteredShops = allShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        // Restore tab bar (Custom floating style) for this screen
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                height: 80,
                position: 'absolute',
                bottom: 2,
                left: 20,
                right: 20,
                elevation: 5,
                backgroundColor: '#ffffff',
                borderRadius: 25,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                borderTopWidth: 0,
                paddingBottom: 20,
                paddingTop: 10,
                display: 'flex'
            }
        });
    }, [navigation]);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleSendOtp = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setModalStep('otp');
        }, 1500);
    };

    const handleVerifyOtp = () => {
        // Validation logic here
        setIsLoginModalVisible(false);
        setModalStep('details'); // Reset for next time
        setOtp(['', '', '', '']);
        // Navigate or show success
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move to next input if text is entered
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
        // Move to previous input if backspace (empty string)
        if (!text && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const renderShopCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.shopName}>{item.name}</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setIsLoginModalVisible(true)}>
                        <Text style={styles.selectButtonText}>Select</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#4CAF50" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.distanceText}> • {item.distance}</Text>
                </View>

                <View style={[styles.slotsBadge, { backgroundColor: item.slotsColor }]}>
                    <Text style={[styles.slotsText, { color: item.slotsTextColor }]}>{item.slots}</Text>
                </View>

                <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                {isSearchVisible ? (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search shops..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => {
                            setIsSearchVisible(false);
                            setSearchQuery('');
                        }}>
                            <Ionicons name="close-circle" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.headerTitle}>Shops List</Text>
                        <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
                            <Ionicons name="search" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <FlatList
                data={filteredShops}
                renderItem={renderShopCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No shops found matching "{searchQuery}"</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isLoginModalVisible}
                onRequestClose={() => {
                    setIsLoginModalVisible(false);
                    setModalStep('details');
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlayTouch}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={1}
                                onPress={() => {
                                    setIsLoginModalVisible(false);
                                    setModalStep('details');
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={styles.modalContent}>
                        <View style={styles.dragHandle} />

                        {modalStep === 'details' ? (
                            <>
                                <Text style={styles.modalTitle}>Login to Book Slot</Text>
                                <Text style={styles.modalSubtitle}>Enter your details to confirm your wash.</Text>

                                {/* Name Input */}
                                <Text style={styles.inputLabel}>Name</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="Enter your name"
                                        placeholderTextColor="#999"
                                    />
                                    <Ionicons name="person" size={20} color="#999" />
                                </View>

                                {/* Phone Input */}
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.phoneContainer}>
                                    <View style={styles.countryCode}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.inputField, { flex: 1, paddingLeft: 10 }]}
                                        placeholder="Enter your phone number"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                {/* Send OTP Button */}
                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleSendOtp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#1a1a1a" />
                                    ) : (
                                        <>
                                            <Text style={styles.continueButtonText}>Send OTP</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 5 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.otpHeaderRow}>
                                    <TouchableOpacity onPress={() => setModalStep('details')} style={{ paddingRight: 10 }}>
                                        <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Verification</Text>
                                </View>
                                <Text style={styles.modalSubtitle}>Enter the 4-digit code sent to +91 98765 XXXXX</Text>

                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={styles.otpBox}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            textAlign="center"
                                        />
                                    ))}
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                                    <Text style={{ color: '#888', marginRight: 5 }}>Didn't receive code?</Text>
                                    <TouchableOpacity>
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>Resend</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleVerifyOtp}
                                >
                                    <Text style={styles.continueButtonText}>Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
        height: 70, // Fixed height to prevent jump
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
        marginRight: 10,
    },
    listContainer: { padding: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 10,
    },
    selectButton: {
        backgroundColor: '#ffeb69',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    selectButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginLeft: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#888',
    },
    slotsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
    },
    slotsText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouch: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    otpHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 30, // Pill shape
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    inputField: {
        flex: 1,
        fontSize: 14,
        color: '#1a1a1a',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    countryCode: {
        marginRight: 10,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    otpBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: '#f9f9f9',
    },
    continueButton: {
        backgroundColor: '#ffeb69',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
});
