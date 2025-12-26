"use client";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppSelector } from "../../../store/hooks";

export default function PastServices() {
  const reduxBookings = useAppSelector((state) =>
    state.bookings.bookings.filter(
      (b) => b.status === "completed" || b.status === "cancelled"
    )
  );

  const bookings = reduxBookings.length > 0 ? reduxBookings : [
    {
      id: "dummy-1",
      center: "Tech Zone Car Spa",
      date: "Oct 12, 2023",
      timeSlot: "10:30 AM",
      car: "Hyundai Creta",
      carImage: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
      status: "completed",
      serviceName: "Premium Foam Wash",
      price: 649,
      plate: "KA 05 AB 1234",
      address: "123, Main Street, Bangalore"
    }
  ];

  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  // Complaint State
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [complaintBooking, setComplaintBooking] = useState<any | null>(null);
  const [complaintText, setComplaintText] = useState("");
  const [complaintImage, setComplaintImage] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeBooking) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeBooking]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => setActiveBooking(null));
  };

  const handleComplaint = (booking: any) => {
    setComplaintBooking(booking);
    setComplaintModalVisible(true);
  };

  const closeComplaintModal = () => {
    setComplaintModalVisible(false);
    setComplaintBooking(null);
    setComplaintText("");
    setComplaintImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setComplaintImage(result.assets[0].uri);
    }
  };

  const submitComplaint = () => {
    if (!complaintText.trim()) {
      Alert.alert("Required", "Please describe your issue.");
      return;
    }

    // optimizing UX with fake delay
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    Alert.alert("Complaint Received", `Your ticket #${ticketId} has been created. Our support team will review it shortly.`);
    closeComplaintModal();
  };

  const renderItem = ({ item }: any) => {
    const isCompleted = item.status === "completed";
    const isCancelled = item.status === "cancelled";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        onPress={() => setActiveBooking(item)}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F5F8FF", "#F7FAE6"]}
          style={styles.sessionCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>{item.center}</Text>

            <Text style={styles.sessionSubtitle}>
              {item.date} • {item.timeSlot}
            </Text>

            <Text style={styles.sessionDuration}>{item.car}</Text>

            <View
              style={[
                styles.statusBadge,
                isCompleted && styles.completedBadge,
                isCancelled && styles.cancelledBadge,
              ]}
            >
              <Ionicons
                name={
                  isCompleted
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={14}
                color={isCompleted ? "#15803D" : "#B91C1C"}
              />
              <Text
                style={[
                  styles.statusText,
                  isCompleted && styles.completedText,
                  isCancelled && styles.cancelledText,
                ]}
              >
                {isCompleted ? "Completed" : "Cancelled"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.complaintButton}
              onPress={() => handleComplaint(item)}
            >
              <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
              <Text style={styles.complaintText}>Complaint</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: item.carImage }}
            style={{ width: 90, height: 90, borderRadius: 12, marginLeft: 16 }}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ marginTop: 80, alignItems: "center" }}>
            <Ionicons name="time-outline" size={48} color="#CBD5E1" />
            <Text style={{ marginTop: 12, color: "#64748B", fontSize: 16 }}>
              No past services yet
            </Text>
          </View>
        }
      />

      {/* Bottom Sheet */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeSheet}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Service Details</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>
          </View>

          {activeBooking && (
            <>
              <View style={styles.summaryCard}>
                <Ionicons name="construct-outline" size={26} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>
                    {activeBooking.serviceName}
                  </Text>
                  <Text style={styles.summaryMeta}>
                    {activeBooking.date} • {activeBooking.timeSlot}
                  </Text>
                </View>

                <View style={styles.completedPill}>
                  <Text style={styles.completedPillText}>COMPLETED</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="car-sport-outline" size={22} />
                <View>
                  <Text style={styles.infoTitle}>{activeBooking.car}</Text>
                  <Text style={styles.infoSub}>{activeBooking.plate}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="location-outline" size={22} />
                <Text style={styles.locationText}>{activeBooking.address}</Text>
              </View>

              <View style={styles.paymentCard}>
                <Text style={styles.paymentLabel}>Total Paid</Text>
                <Text style={styles.paymentAmount}>{activeBooking.price}</Text>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>

      {/* Complaint Modal */}
      <Modal
        visible={complaintModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeComplaintModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.complaintModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raise Complaint</Text>
              <TouchableOpacity onPress={closeComplaintModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.complaintScroll}>
              <Text style={styles.complaintSubtitle}>
                Tell us about the issue with your service on {complaintBooking?.date}
              </Text>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe what went wrong..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={complaintText}
                onChangeText={setComplaintText}
              />

              <Text style={styles.inputLabel}>Upload Photo (Optional)</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                {complaintImage ? (
                  <Image source={{ uri: complaintImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={24} color="#666" />
                    <Text style={styles.uploadText}>Tap to select image</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={submitComplaint}>
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },

  sessionCard: {
    backgroundColor: "#F5F8FF",
    borderRadius: 20,
    padding: 20,
    // paddingBottom: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sessionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  sessionSubtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },

  sessionDuration: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  completedBadge: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignSelf: "flex-start",
  },
  completedText: {
    color: "#15803D",
    fontSize: 13,
    fontWeight: "600",
  },

  sessionButton: {
    marginTop: 18,
    backgroundColor: "#000",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },

  sessionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 50,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  summaryCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  summaryMeta: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 14,
  },

  completedPill: {
    backgroundColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },

  infoCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  infoTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#1E293B",
  },
  infoSub: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    color: "#444",
    fontSize: 15,
  },

  paymentCard: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    color: "#64748B",
    fontSize: 16,
  },
  paymentAmount: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  statusBadge: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  cancelledBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  cancelledText: {
    color: "#B91C1C",
  },

  complaintButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FAC7C7'
  },
  complaintText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },

  // Complaint Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  complaintModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  complaintScroll: {
    paddingBottom: 20,
  },
  complaintSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 10,
  },
  textArea: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#eee',
  },
  uploadButton: {
    height: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
