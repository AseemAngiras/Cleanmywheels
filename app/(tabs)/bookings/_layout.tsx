import { RootState } from "@/store";
import { useGetBookingsQuery } from "@/store/api/bookingApi";
import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

// --- MOCK DATA FOR ADMIN BOOKINGS ---

const ADMIN_BOOKINGS = [
  {
    id: '1',
    customerName: 'Alex Johnson',
    time: '09:00 AM',
    status: 'CONFIRMED',
    car: 'Tesla Model 3 (Grey)',
    license: 'ABC-1234',
    service: 'Full Exterior Wash',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    phone: '919876543210',
    address: 'Block A, Sector 14, Gurgaon, Haryana'
  },
  {
    id: '2',
    customerName: 'Sarah Miller',
    time: '10:30 AM',
    status: 'IN-PROGRESS',
    car: 'BMW X5 (Black)',
    license: 'BMW-9988',
    service: 'Interior Detailing',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    phone: '919876543211',
    address: 'Flat 402, Sunshine Apartments, Delhi'
  }
];

const MOCK_WORKERS = [
  { id: 'W1', name: 'Amit Sharma', phone: '+919876543210' },
  { id: 'W2', name: 'Rahul Verma', phone: '+918765432109' },
  { id: 'W3', name: 'Suresh Singh', phone: '+917654321098' },
  { id: 'W4', name: 'Vikram Yadav', phone: '+916543210987' },
];

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

  // Fetch Real Bookings
  const { data: bookingsData, isLoading, refetch } = useGetBookingsQuery();

  console.log("AdminBookingsScreen Debug:", {
    bookingsData,
    isLoading,
    list: bookingsData?.data?.bookingList
  });

  // Process Bookings
  const allBookings = bookingsData?.data?.bookingList || [];

  // Filter Logic
  const filteredBookings = allBookings.filter((b) => {
    if (filter === 'All') return true;
    // Backend uses Title Case: 'Pending', 'Confirmed', 'Completed', 'In Progress'
    if (filter === 'Pending') {
      return b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress' || b.status === 'upcoming' || b.status === 'pending';
    }
    if (filter === 'Completed') {
      return b.status === 'Completed' || b.status === 'completed';
    }
    return true;
  });

  const handleAssignWorker = (worker: any) => {
    setWorkerModalVisible(false);

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to ${selectedBooking?.user?.name || 'Customer'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Notify",
          onPress: () => {
            // 1. Send WhatsApp to User
            const customerName = selectedBooking?.user?.name || 'Valued Customer';
            let customerPhone = selectedBooking?.user?.phone || selectedBooking?.phone || '';
            // Clean phone number: remove non-numeric chars
            customerPhone = customerPhone.replace(/\D/g, '');
            if (customerPhone.length === 10) {
              customerPhone = '91' + customerPhone;
            }

            const serviceString = selectedBooking.serviceName || selectedBooking.washPackage?.name || "Service";
            const vehicleString = selectedBooking.vehicleType || 'Car';

            const userMsg = `Hello ${customerName}, your ${serviceString} for ${vehicleString} (${selectedBooking.vehicleNo || ''}) has been assigned to ${worker.name} (Ph: ${worker.phone}). They will arrive shortly.`;
            const userUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(userMsg)}`;

            Linking.openURL(userUrl).catch((err) => {
              console.log("WhatsApp Error:", err);
              Alert.alert("Error", "Could not open WhatsApp. Valid phone number required.");
            });

            // 2. Prompt to Send WhatsApp to Worker (Sequential Step)
            setTimeout(() => {
              Alert.alert(
                "Notify Worker",
                "Send job details to the worker now?",
                [
                  { text: "Skip", style: "cancel" },
                  {
                    text: "Send to Worker",
                    onPress: () => {
                      const addressString = selectedBooking.address?.fullAddress || selectedBooking.address?.locality || (selectedBooking.locality ? `${selectedBooking.houseOrFlatNo ? selectedBooking.houseOrFlatNo + ', ' : ''}${selectedBooking.locality}, ${selectedBooking.city}` : 'Address not provided');
                      const serviceString = selectedBooking.serviceName || selectedBooking.washPackage?.name || "Service";
                      const timeString = selectedBooking.bookingTime ? `${selectedBooking.bookingTime}:00` : 'TBD';
                      const dateString = new Date(selectedBooking.bookingDate || selectedBooking.date).toLocaleDateString();

                      let workerPhone = worker.phone || '';
                      workerPhone = workerPhone.replace(/\D/g, '');
                      if (workerPhone.length === 10) {
                        workerPhone = '91' + workerPhone;
                      }

                      const workerMsg = `🛠 *New Job Assigned!*\n\n👤 Client: ${customerName}\n🚗 Car: ${selectedBooking.vehicleType || 'Car'} (${selectedBooking.vehicleNo || '- '})\n📋 Service: ${serviceString}\n⏰ Time: ${timeString} on ${dateString}\n📍 Address: ${addressString}\n📞 Phone: ${customerPhone}`;
                      const workerUrl = `https://wa.me/${workerPhone}?text=${encodeURIComponent(workerMsg)}`;

                      console.log("Opening WhatsApp for Worker:", workerUrl);

                      Linking.openURL(workerUrl).catch(() => Alert.alert("Error", "Could not open WhatsApp for Worker"));
                    }
                  }
                ]
              );
            }, 1000); // Small delay to allow app interaction
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

  const renderCard = ({ item }: { item: any }) => (
    <View style={adminStyles.card}>
      <View style={adminStyles.cardHeader}>
        <View style={adminStyles.userInfo}>
          {/* Fallback avatar if no image provided */}
          <Image
            source={{ uri: item.user?.avatar || 'https://ui-avatars.com/api/?name=' + (item.user?.name || 'User') + '&background=random' }}
            style={adminStyles.avatar}
          />
          <View>
            <Text style={adminStyles.userName}>{item.user?.name || 'Customer'}</Text>
            <View style={adminStyles.timeRow}>
              <Ionicons name="time" size={12} color="#007BFF" />
              <Text style={adminStyles.timeText}>
                {/* Format Time: 10 -> 10:00 AM */}
                {item.bookingTime ? `${item.bookingTime}:00` : 'TBD'} • {new Date(item.bookingDate || item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <View style={[adminStyles.statusBadge, (item.status === 'Completed' || item.status === 'completed') ? adminStyles.badgeConfirmed : adminStyles.badgeProgress]}>
          <View style={adminStyles.statusDot} />
          <Text style={adminStyles.statusText}>{item.status ? item.status.toUpperCase() : 'PENDING'}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={adminStyles.detailsContainer}>
        <View style={adminStyles.detailRow}>
          <Ionicons name="car-sport-outline" size={16} color="#666" style={adminStyles.detailIcon} />
          <View>
            <Text style={adminStyles.detailTitle}>{item.vehicleType || 'Car'}</Text>
            <Text style={adminStyles.detailSub}>{item.vehicleNo || item.plate || 'No Plate'}</Text>
          </View>
        </View>
        <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
          <Ionicons name="water-outline" size={16} color="#666" style={adminStyles.detailIcon} />
          <Text style={adminStyles.detailTitle}>{item.washPackage?.name || item.serviceName || 'Unknown Service'}</Text>
        </View>
        <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
          <Ionicons name="location-outline" size={16} color="#666" style={adminStyles.detailIcon} />
          <Text style={[adminStyles.detailSub, { flex: 1 }]} numberOfLines={2}>
            {item.address?.fullAddress ||
              item.address?.locality ||
              (item.locality ? `${item.houseOrFlatNo ? item.houseOrFlatNo + ', ' : ''}${item.locality}, ${item.city}` : 'Address not provided')}
          </Text>
        </View>
      </View>

      {/* Action Button */}
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
    </View>
  );

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

      {/* List */}
      <FlatList
        data={filteredBookings}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={renderCard}
        keyExtractor={item => item._id}
        contentContainerStyle={adminStyles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={adminStyles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <Text style={adminStyles.emptyText}>No {filter.toLowerCase()} bookings</Text>
            )}
          </View>
        }
      />

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
  const isAdmin = useSelector((state: RootState) => state.user.user?.accountType === 'Super Admin');

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

