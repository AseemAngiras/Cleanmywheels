import { RootState } from '@/store';
import { addBooking } from '@/store/slices/bookingSlice';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BookingStepper from '../../../../components/BookingStepper';

export default function BookingSummaryScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { bookingDraft } = useLocalSearchParams();

  const parsedBooking = bookingDraft
    ? JSON.parse(bookingDraft as string)
    : null;

  const user = useSelector((state: RootState) => state.user);
  const { service, vehicle, shop, slot } = parsedBooking || {};

  const lat = shop?.location?.lat || 37.7749;
  const long = shop?.location?.long || -122.4194;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('upi');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Set default payment method if available (optional)
  useEffect(() => {
    // Example: Default to first option
    // setSelectedPaymentMethod('upi'); 
  }, []);

  const itemTotal = service?.totalPrice || 0;
  const taxAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + taxAmount;

  const paymentOptions = [
    { id: 'upi', label: 'UPI', subLabel: 'Google Pay, PhonePe, Paytm', icon: 'wallet-outline', recommended: true },
    { id: 'card', label: 'Credit / Debit Cards', subLabel: 'VISA, MasterCard', icon: 'card-outline' },
    { id: 'netbanking', label: 'Netbanking', subLabel: 'All major banks supported', icon: 'business-outline' },
    { id: 'cash', label: 'Pay with Cash', subLabel: 'Pay after service completion', icon: 'cash-outline' },
  ];

  const selectedPaymentOption = paymentOptions.find(opt => opt.id === selectedPaymentMethod);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <BookingStepper currentStep={3} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Map */}
        {/* Shop Details (No Map) */}
        <View style={[styles.card, { marginTop: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.shopIconContainer}>
              <Ionicons name="location" size={20} color="#fbc02d" />
            </View>
            <View>
              <Text style={styles.pinShopName}>{shop?.name}</Text>
              <Text style={styles.pinShopAddress} numberOfLines={1}>
                {shop?.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="car-sport" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>
                {vehicle?.type?.toUpperCase()} - {vehicle?.number}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>
                {new Date(slot?.date).toLocaleDateString()} • {slot?.time}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="call" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Contact Number</Text>
              <Text style={styles.value}>+91 {user?.phone}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>{service?.name}</Text>
            <Text style={styles.paymentValue}>₹{service?.totalPrice}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.totalTextLabel}>Tax (18% GST)</Text>
            <Text style={styles.totalTextValue}>₹{taxAmount}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.totalTextLabel}>Grand Total</Text>
            <Text style={styles.totalTextValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.paymentMethodSelector}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.payUsingRow}>
            {selectedPaymentOption && (
              <Ionicons
                name={selectedPaymentOption.icon as any}
                size={14}
                color="#666"
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={styles.payUsingText}>PAY USING</Text>
            <Ionicons name="caret-up" size={10} color="#666" style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.selectedMethodText} numberOfLines={1}>
            {selectedPaymentOption ? selectedPaymentOption.label : 'Select Payment Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, !selectedPaymentMethod && styles.payButtonDisabled]}
          disabled={!selectedPaymentMethod}
          onPress={() => {
            if (!selectedPaymentMethod) {
              Alert.alert('Payment Required', 'Please select a payment option');
              return;
            }

            dispatch(
              addBooking({
                center: shop.name,
                address: shop.address,
                phone: user.phone,
                serviceName: service.name,
                price: grandTotal,
                date: new Date(slot.date).toDateString(),
                timeSlot: slot.time,
                car: `${vehicle.type} - ${vehicle.number}`,
                plate: vehicle.number,
                carImage: shop.image,
              })
            );

            router.replace('/(tabs)/home/book-service/order-confirmation');
          }}
        >
          <View style={styles.payButtonContent}>
            <View style={styles.payButtonPriceContainer}>
              <Text style={styles.payButtonPriceText}>₹{grandTotal}</Text>
              <Text style={styles.payButtonTotalLabel}>TOTAL</Text>
            </View>
            <View style={styles.payButtonActionContainer}>
              <Text style={styles.payButtonActionText}>Pay Now</Text>
              <Ionicons name="caret-forward" size={16} color="#1a1a1a" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Payment Options Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowPaymentModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Options</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {paymentOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selectedPaymentMethod === option.id && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedPaymentMethod(option.id);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={styles.optionRow}>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioInfo,
                          selectedPaymentMethod === option.id
                            ? styles.radioSelected
                            : styles.radioUnselected,
                        ]}
                      >
                        {selectedPaymentMethod === option.id && <View style={styles.radioDot} />}
                      </View>
                    </View>

                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionSubLabel}>{option.subLabel}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

  // Map
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  shopPinCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF9C4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pinShopName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  pinShopAddress: { fontSize: 10, color: '#666', marginTop: 2 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rowContent: {
    flex: 1,
  },
  label: { fontSize: 12, color: '#888', marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
    marginLeft: 51, // offset icon width
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: { fontSize: 14, color: '#666' },
  paymentValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  totalTextLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  totalTextValue: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

  // Footer & Payment Selector
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodSelector: {
    flex: 1,
    marginRight: 15,
    justifyContent: 'center',
  },
  payUsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  payUsingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
  },
  selectedMethodText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  payButton: {
    backgroundColor: '#C8F000',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1.2, // Give button more space
    height: 50,
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payButtonPriceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  payButtonPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  payButtonTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    opacity: 0.6,
  },
  payButtonActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  // Reusing Option Card Styles
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    // Minimal shadow for list items
  },
  optionCardSelected: {
    borderColor: '#84c95c',
    backgroundColor: '#f8fff5',
  },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  radioContainer: { marginRight: 15, paddingTop: 2 },
  radioInfo: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center'
  },
  radioUnselected: { borderColor: '#ddd' },
  radioSelected: { borderColor: '#84c95c' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#84c95c' },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  optionSubLabel: { fontSize: 12, color: '#666' },
});
