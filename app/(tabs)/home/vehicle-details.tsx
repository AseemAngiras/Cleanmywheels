import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function VehicleDetailsScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const [vehicleType, setVehicleType] = useState('sedan');
    const [vehicleNumber, setVehicleNumber] = useState('');

    useEffect(() => {
        // Hide the bottom tab bar when this screen is mounted or focused
        const unsubscribe = navigation.addListener('focus', () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });
        });

        // Initial hide check in case focus doesn't trigger on mount
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: "none" }
        });

        return unsubscribe;
    }, [navigation]);

    const vehicleTypes = [
        { id: 'hatchback', name: 'Hatchback', icon: 'car-hatchback' },
        { id: 'sedan', name: 'Sedan', icon: 'car' },
        { id: 'suv', name: 'SUV', icon: 'car-estate' }, // Using estate as closest to generic SUV in MDI if suv not avail
        { id: 'others', name: 'Others', icon: 'truck-delivery' },
    ];

    // Note: MaterialCommunityIcons used for better car type variety

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Vehicle Details</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <ScrollView
                            contentContainerStyle={[styles.container, { paddingBottom: 130 }]}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.sectionTitle}>Select Vehicle Type</Text>

                            <View style={styles.gridContainer}>
                                {vehicleTypes.map((type) => {
                                    const isSelected = vehicleType === type.id;
                                    return (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={[
                                                styles.typeCard,
                                                isSelected && styles.selectedTypeCard
                                            ]}
                                            onPress={() => setVehicleType(type.id)}
                                        >
                                            {isSelected && (
                                                <View style={styles.checkmarkContainer}>
                                                    <Ionicons name="checkmark-circle" size={20} color="#84c95c" />
                                                </View>
                                            )}
                                            <View style={[
                                                styles.iconContainer,
                                                isSelected ? styles.selectedIconContainer : styles.unselectedIconContainer
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={type.icon as any}
                                                    size={32}
                                                    color={isSelected ? "#1a1a1a" : "#999"}
                                                />
                                            </View>
                                            <Text style={[
                                                styles.typeText,
                                                isSelected && styles.selectedTypeText
                                            ]}>
                                                {type.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.sectionTitle}>Vehicle Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.G. IND-1234"
                                placeholderTextColor="#ccc"
                                value={vehicleNumber}
                                onChangeText={setVehicleNumber}
                                autoCapitalize="characters"
                            />

                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.nextButton} onPress={() => {
                                router.push({
                                    pathname: '/(tabs)/home/shops-list',
                                    params: {
                                        ...params,
                                        vehicleType,
                                        vehicleNumber: vehicleNumber.toUpperCase()
                                    }
                                });
                            }}>
                                <Text style={styles.nextButtonText}>Next</Text>
                                <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    container: { padding: 20 },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        color: '#1a1a1a',
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    typeCard: {
        width: '48%',
        aspectRatio: 1.1,
        backgroundColor: '#fff',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#f0f0f0', // Slight border for unselected
        position: 'relative',
    },
    selectedTypeCard: {
        borderColor: '#84c95c',
        backgroundColor: '#f0f9eb',
    },
    iconContainer: {
        padding: 15,
        borderRadius: 20,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unselectedIconContainer: {
        backgroundColor: '#f5f5f5',
    },
    selectedIconContainer: {
        backgroundColor: '#84c95c', // Green background for icon
    },
    checkmarkContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
    typeText: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedTypeText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
    },

    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#ffeb69',
        paddingVertical: 16,
        width: '100%',
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ffeb69',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
});

