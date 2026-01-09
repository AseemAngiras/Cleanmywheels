import { RootState } from "@/store";
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from "@/store/api/bookingApi";
import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Linking, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

// --- MOCK WORKERS (Keep for now, could be a separate API later) ---
const MOCK_WORKERS = [
  { id: 'W1', name: 'Amit Sharma', phone: '+919876543210' },
  { id: 'W2', name: 'Rahul Verma', phone: '+918765432109' },
  { id: 'W3', name: 'Suresh Singh', phone: '+917654321098' },
  { id: 'W4', name: 'Vikram Yadav', phone: '+916543210987' },
];

// --- Helper to format booking time ---
const formatTime = (hour: number): string => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

// --- Helper to map backend booking to UI format ---
const mapBookingToUI = (booking: any) => {
  // Debug: Log raw booking data
  console.log('[AdminBookings] Raw booking:', JSON.stringify(booking, null, 2));

  // Try multiple sources for service name
  const serviceName =
    booking.serviceName ||
    booking.washPackage?.name ||
    (typeof booking.washPackage === 'string' ? null : booking.washPackage?.name) ||
    'Unknown Service';

  return {
    id: booking._id,
    customerName: booking.user?.name || 'Customer',
    time: formatTime(booking.bookingTime),
    status: booking.status?.toUpperCase() || 'PENDING',
    car: `${booking.vehicleType || booking.vehicle?.type || 'Car'} (${booking.vehicleNo || booking.vehicle?.number || 'N/A'})`,
    license: booking.vehicleNo || booking.vehicle?.number || 'N/A',
    service: serviceName,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    phone: booking.user?.phone ? `91${booking.user.phone}` : '',
    address: booking.locality
      ? `${booking.houseOrFlatNo || ''}, ${booking.locality}, ${booking.city || ''}`.replace(/^, /, '')
      : (booking.address?.locality ? `${booking.address.houseOrFlatNo || ''}, ${booking.address.locality}` : 'Address not provided'),
    price: booking.price,
    bookingDate: booking.bookingDate,
  };
};

// --- DYNAMIC DATES GENERATOR ---
const getNextSevenDays = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      fullDate: d,
      active: i === 0 // Make today active by default
    });
  }
  return dates;
};

function AdminBookingsScreen() {
  const [filter, setFilter] = useState('All');
  const [dates] = useState(getNextSevenDays());
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch real bookings from API
  const { data: bookingsResponse, isLoading, error, refetch } = useGetBookingsQuery({ page: 1, perPage: 100 });
  const [updateBookingStatus, { isLoading: isUpdatingStatus }] = useUpdateBookingStatusMutation();

  // Map backend data to UI format
  const bookingList = bookingsResponse?.data?.bookingList || [];
  const bookings = bookingList.map((booking: any) => mapBookingToUI(booking));

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter((booking: ReturnType<typeof mapBookingToUI>) => {
    if (filter === 'Pending') return booking.status === 'PENDING' || booking.status === 'IN-PROGRESS';
    if (filter === 'Completed') return booking.status === 'COMPLETED';
    return true; // 'All'
  });

  const handleAssignWorker = async (worker: any) => {
    setWorkerModalVisible(false);

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to ${selectedBooking?.customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Notify",
          onPress: async () => {
            try {
              // Update booking status to PENDING (in-progress)
              await updateBookingStatus({ id: selectedBooking.id, status: 'Pending' }).unwrap();

              // 1. Send WhatsApp to User
              const userMsg = `Hello ${selectedBooking.customerName}, your service for ${selectedBooking.car} has been assigned to ${worker.name} (Ph: ${worker.phone}). They will arrive shortly.`;
              const userUrl = `https://wa.me/${selectedBooking.phone}?text=${encodeURIComponent(userMsg)}`;

              Linking.openURL(userUrl).catch(() => {
                Alert.alert("Error", "Could not open WhatsApp");
              });

              // 2. Prompt to Send WhatsApp to Worker (Sequential Step)
              setTimeout(() => {
                Alert.alert(
                  "Notify Worker",
                  "Send job details to the worker now?",
                  [
                    { text: "Skip", style: "cancel", onPress: () => refetch() },
                    {
                      text: "Send to Worker",
                      onPress: () => {
                        const workerPhone = worker.phone.replace(/[^0-9]/g, '');
                        const workerMsg = `🛠 *New Job Assigned!*\n\n👤 Client: ${selectedBooking.customerName}\n🚗 Car: ${selectedBooking.car} (${selectedBooking.license})\n📋 Service: ${selectedBooking.service}\n⏰ Time: ${selectedBooking.time}\n📍 Address: ${selectedBooking.address}\n📞 Phone: ${selectedBooking.phone}`;
                        const workerUrl = `https://wa.me/${workerPhone}?text=${encodeURIComponent(workerMsg)}`;
                        Linking.openURL(workerUrl).catch(() => Alert.alert("Error", "Could not open WhatsApp for Worker"));
                        refetch();
                      }
                    }
                  ]
                );
              }, 1000);
            } catch (err) {
              console.error('Failed to update booking status:', err);
              Alert.alert('Error', 'Failed to assign worker. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle marking a booking as complete
  const handleMarkComplete = async (booking: ReturnType<typeof mapBookingToUI>) => {
    Alert.alert(
      "Mark as Complete",
      `Mark this booking for ${booking.customerName} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await updateBookingStatus({ id: booking.id, status: 'Completed' }).unwrap();
              Alert.alert('Success', 'Booking marked as completed!');
              refetch();
            } catch (err) {
              console.error('Failed to mark complete:', err);
              Alert.alert('Error', 'Failed to update booking status.');
            }
          }
        }
      ]
    );
  };


  // Format current month and year (e.g., "December 2025")
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleWhatsApp = (phone: string, name: string) => {
    Alert.alert(
      "Open WhatsApp",
      `Are you sure you want to contact ${name} on WhatsApp?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Open",
          onPress: () => {
            const url = `whatsapp://send?phone=${phone}&text=Hello ${name}, regarding your car service booking...`;
            Linking.openURL(url).catch(() => alert('WhatsApp not installed'));
          }
        }
      ]
    );
  };

  // Helper to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { backgroundColor: '#dcfce7', borderColor: '#86efac' };
      case 'PENDING':
      case 'IN-PROGRESS': return { backgroundColor: '#fef9c3', borderColor: '#fde047' };
      default: return { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' }; // CONFIRMED
    }
  };

  const renderCard = ({ item }: { item: ReturnType<typeof mapBookingToUI> }) => {
    const isAssigned = item.status === 'PENDING' || item.status === 'IN-PROGRESS';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <View style={adminStyles.card}>
        <View style={adminStyles.cardHeader}>
          <View style={adminStyles.userInfo}>
            <Image source={{ uri: item.avatar }} style={adminStyles.avatar} />
            <View>
              <Text style={adminStyles.userName}>{item.customerName}</Text>
              <View style={adminStyles.timeRow}>
                <Ionicons name="time" size={12} color="#007BFF" />
                <Text style={adminStyles.timeText}>{item.time}</Text>
              </View>
            </View>
          </View>
          <View style={[adminStyles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <View style={[adminStyles.statusDot, isCompleted && { backgroundColor: '#22c55e' }, isAssigned && { backgroundColor: '#eab308' }]} />
            <Text style={adminStyles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={adminStyles.detailsContainer}>
          <View style={adminStyles.detailRow}>
            <Ionicons name="car-sport-outline" size={16} color="#666" style={adminStyles.detailIcon} />
            <View>
              <Text style={adminStyles.detailTitle}>{item.car}</Text>
              <Text style={adminStyles.detailSub}>{item.license}</Text>
            </View>
          </View>
          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
            <Ionicons name="water-outline" size={16} color="#666" style={adminStyles.detailIcon} />
            <Text style={adminStyles.detailTitle}>{item.service}</Text>
          </View>
          {/* Address */}
          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
            <Ionicons name="location-outline" size={16} color="#666" style={adminStyles.detailIcon} />
            <Text style={[adminStyles.detailTitle, { flex: 1 }]} numberOfLines={2}>{item.address}</Text>
          </View>
          {/* Phone */}
          {item.phone && (
            <TouchableOpacity
              style={[adminStyles.detailRow, { marginTop: 12 }]}
              onPress={() => {
                const phoneUrl = `tel:+${item.phone}`;
                Linking.openURL(phoneUrl).catch(() => Alert.alert('Error', 'Could not open dialer'));
              }}
            >
              <Ionicons name="call-outline" size={16} color="#007BFF" style={adminStyles.detailIcon} />
              <Text style={[adminStyles.detailTitle, { color: '#007BFF' }]}>+{item.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons - Conditional based on status */}
        {!isAssigned && !isCompleted && (
          <TouchableOpacity
            style={[adminStyles.whatsappButton, { backgroundColor: '#1a1a1a' }]}
            onPress={() => {
              setSelectedBooking(item);
              setWorkerModalVisible(true);
            }}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={adminStyles.whatsappButtonText}>Assign Worker</Text>
          </TouchableOpacity>
        )}

        {isAssigned && (
          <TouchableOpacity
            style={[adminStyles.whatsappButton, { backgroundColor: '#22c55e' }]}
            onPress={() => handleMarkComplete(item)}
            disabled={isUpdatingStatus}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={adminStyles.whatsappButtonText}>
              {isUpdatingStatus ? 'Updating...' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={[adminStyles.whatsappButton, { backgroundColor: '#e5e7eb' }]}>
            <Ionicons name="checkmark-done" size={18} color="#6b7280" />
            <Text style={[adminStyles.whatsappButtonText, { color: '#6b7280' }]}>Completed</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={adminStyles.container}>
      {/* Page Title */}
      <View style={adminStyles.titleHeader}>
        <Text style={adminStyles.titleText}>Bookings Management</Text>
      </View>

      {/* Calendar Strip */}
      <View style={adminStyles.calendarContainer}>
        <Text style={adminStyles.monthTitle}>{currentMonthYear}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={adminStyles.datesScroll}>
          {dates.map((d, i) => (
            <TouchableOpacity key={i} style={[adminStyles.dateBox, d.active && adminStyles.activeDateBox]}>
              <Text style={[adminStyles.dayText, d.active && adminStyles.activeDateText]}>{d.day}</Text>
              <Text style={[adminStyles.dateText, d.active && adminStyles.activeDateText]}>{d.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={adminStyles.filterContainer}>
        {['All', 'Pending', 'Completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[adminStyles.filterTab, filter === f && adminStyles.activeFilterTab]}
            onPress={() => setFilter(f)}
          >
            <Text style={[adminStyles.filterText, filter === f && adminStyles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={adminStyles.emptyContainer}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={[adminStyles.emptyText, { marginTop: 10 }]}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={adminStyles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
          <Text style={[adminStyles.emptyText, { marginTop: 10, color: '#ff6b6b' }]}>Failed to load bookings</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1a1a1a', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* List */
        <FlatList
          data={filteredBookings}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={adminStyles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={adminStyles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={[adminStyles.emptyText, { marginTop: 10 }]}>No {filter.toLowerCase()} bookings</Text>
            </View>
          }
        />
      )}

      {/* WORKER SELECTION MODAL */}
      <Modal
        visible={workerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkerModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropTouchable} onPress={() => setWorkerModalVisible(false)} />
          <View style={styles.workerModalContainer}>
            <View style={styles.workerHeader}>
              <Text style={styles.sheetTitle}>Select Worker</Text>
              <TouchableOpacity onPress={() => setWorkerModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOCK_WORKERS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.workerRow} onPress={() => handleAssignWorker(item)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.workerAvatar}>
                      <Text style={styles.workerInitials}>{item.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.workerName}>{item.name}</Text>
                      <Text style={styles.workerPhone}>{item.phone}</Text>
                    </View>
                  </View>
                  <View style={styles.assignBtn}>
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function BookingsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === 'Super Admin';

  if (isAdmin) {
    return <AdminBookingsScreen />;
  }

  const isUpcoming = pathname.includes("upcoming");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Bookings</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, isUpcoming && styles.activeToggle]}
          onPress={() => router.replace("/bookings/upcoming-services")}
        >
          <Text style={isUpcoming ? styles.activeText : styles.inactiveText}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, !isUpcoming && styles.activeToggle]}
          onPress={() => router.replace("/bookings/past-services")}
        >
          <Text style={!isUpcoming ? styles.activeText : styles.inactiveText}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 19,
    paddingTop: 10,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 50,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 8,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: "#000",
  },
  activeText: {
    fontSize: 15,
    color: "#ebebeb",
  },
  inactiveText: {
    color: "#000",
    fontSize: 15,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: { flex: 1 },
  workerModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '50%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  workerPhone: {
    fontSize: 12,
    color: '#6B7280',
  },
  assignBtn: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignBtnText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 12,
  },
});

const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  titleHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  datesScroll: {
    paddingRight: 20,
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  activeDateBox: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  activeDateText: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 30,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeFilterTab: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeConfirmed: { backgroundColor: '#e8f5e9' },
  badgeProgress: { backgroundColor: '#fff9c4' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a1a1a' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#1a1a1a' },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 20,
    textAlign: 'center',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp Green
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});

