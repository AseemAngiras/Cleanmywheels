
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EnterLocationScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
        });
    }, [navigation]);

    const [flatNumber, setFlatNumber] = useState('');
    const [buildingName, setBuildingName] = useState('');
    const [locality, setLocality] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [addressType, setAddressType] = useState<'Home' | 'Work'>('Home');

    const [errorMsg, setErrorMsg] = useState('');

    const handleConfirm = () => {
        setErrorMsg(''); // Clear previous errors
        if (!flatNumber.trim()) {
            setErrorMsg('Please enter House / Flat Number');
            return;
        }
        if (!buildingName.trim()) {
            setErrorMsg('Please enter Building / Street Name');
            return;
        }
        if (!locality.trim()) {
            setErrorMsg('Please enter Locality / Area');
            return;
        }
        if (!city.trim()) {
            setErrorMsg('Please enter City');
            return;
        }
        if (!pincode.trim() || pincode.length < 6) {
            setErrorMsg('Please enter a valid 6-digit Pincode');
            return;
        }

        const fullAddress = `${flatNumber}, ${buildingName}, ${locality}, ${city}, ${pincode}`;

        router.push({
            pathname: '/(tabs)/home/book-doorstep/select-service',
            params: {
                address: fullAddress,
                latitude: "37.7749",
                longitude: "-122.4194",
                flatNumber,
                buildingName,
                locality,
                landmark,
                city,
                pincode,
                addressType
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enter Location</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Use Current Location */}
                    <TouchableOpacity style={styles.currentLocationRow}>
                        <View style={styles.locationIconBg}>
                            <Ionicons name="navigate" size={18} color="#1a1a1a" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.clTitle}>Use current location</Text>
                            <Text style={styles.clSubtitle}>Enable location services</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionHeader}>ADDRESS DETAILS</Text>

                    {/* Inputs */}
                    <TextInput
                        style={[styles.input, !flatNumber.trim() && errorMsg.includes('House') && styles.inputError]}
                        placeholder="House / Flat Number"
                        placeholderTextColor="#ccc"
                        value={flatNumber}
                        onChangeText={(t) => { setFlatNumber(t); if (errorMsg) setErrorMsg(''); }}
                    />
                    <TextInput
                        style={[styles.input, !buildingName.trim() && errorMsg.includes('Building') && styles.inputError]}
                        placeholder="Building / Street Name"
                        placeholderTextColor="#ccc"
                        value={buildingName}
                        onChangeText={(t) => { setBuildingName(t); if (errorMsg) setErrorMsg(''); }}
                    />
                    <TextInput
                        style={[styles.input, !locality.trim() && errorMsg.includes('Locality') && styles.inputError]}
                        placeholder="Locality / Area"
                        placeholderTextColor="#ccc"
                        value={locality}
                        onChangeText={(t) => { setLocality(t); if (errorMsg) setErrorMsg(''); }}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Landmark (Optional)"
                        placeholderTextColor="#ccc"
                        value={landmark}
                        onChangeText={setLandmark}
                    />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            style={[styles.input, { flex: 1 }, !city.trim() && errorMsg.includes('City') && styles.inputError]}
                            placeholder="City"
                            placeholderTextColor="#ccc"
                            value={city}
                            onChangeText={(t) => { setCity(t); if (errorMsg) setErrorMsg(''); }}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }, (!pincode.trim() || pincode.length < 6) && errorMsg.includes('Pincode') && styles.inputError]}
                            placeholder="Pincode"
                            placeholderTextColor="#ccc"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={pincode}
                            onChangeText={(t) => { setPincode(t); if (errorMsg) setErrorMsg(''); }}
                        />
                    </View>

                    {/* Address Type Tags */}
                    <View style={styles.tagRow}>
                        <TouchableOpacity
                            style={[styles.tag, addressType === 'Home' && styles.tagSelected]}
                            onPress={() => setAddressType('Home')}
                        >
                            <Ionicons name="home" size={16} color={addressType === 'Home' ? '#1a1a1a' : '#666'} style={{ marginRight: 5 }} />
                            <Text style={[styles.tagText, addressType === 'Home' && styles.tagTextSelected]}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tag, addressType === 'Work' && styles.tagSelected]}
                            onPress={() => setAddressType('Work')}
                        >
                            <Ionicons name="briefcase" size={16} color={addressType === 'Work' ? '#1a1a1a' : '#666'} style={{ marginRight: 5 }} />
                            <Text style={[styles.tagText, addressType === 'Work' && styles.tagTextSelected]}>Work</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Button */}
            <View style={styles.footer}>
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>Confirm Address</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        // Minimal header, no shadow per design
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f5f5f5', // Use light grey for circle bg if needed, or white
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for footer
    },

    currentLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF9C4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    clTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
    clSubtitle: { fontSize: 13, color: '#888' },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 13,
        color: '#666',
        fontWeight: 'bold',
        marginBottom: 20,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 15,
        color: '#1a1a1a',
        marginBottom: 15,
    },
    tagRow: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 30,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        marginRight: 15,
    },
    tagSelected: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0', // Keep specific border
        elevation: 1,
    },
    tagText: { fontSize: 14, fontWeight: '600', color: '#666' },
    tagTextSelected: { color: '#1a1a1a' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#C8F000',

        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },

    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#d32f2f',
        backgroundColor: '#ffebee',
    },
});
