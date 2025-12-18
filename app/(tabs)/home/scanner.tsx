import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScannerScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });
        }, [navigation])
    );

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        Alert.alert(
            "Scanned!",
            `Bar code with type ${type} and data ${data} has been scanned!`,
            [{ text: "OK", onPress: () => setScanned(false) }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13"],
                }}
            >
                <View style={styles.overlay}>
                    {/* Header: Close Button */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Scan QR Code</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Center Focus Box */}
                    <View style={styles.focusContainer}>
                        <View style={styles.focusBox}>
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </View>
                        <Text style={styles.instructionText}>Align code within the frame</Text>
                    </View>

                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50, // Safe Area top roughly
        paddingHorizontal: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    focusContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusBox: {
        width: 250,
        height: 250,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    instructionText: {
        color: '#fff',
        marginTop: 20,
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    // Fancy Corners
    cornerTL: { position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#C8F000', borderTopLeftRadius: 20 },
    cornerTR: { position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#C8F000', borderTopRightRadius: 20 },
    cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#C8F000', borderBottomLeftRadius: 20 },
    cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#C8F000', borderBottomRightRadius: 20 },
});
