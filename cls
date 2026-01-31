[1mdiff --git a/app/(tabs)/_layout.tsx b/app/(tabs)/_layout.tsx[m
[1mindex 3b620c4a..7d1c03d8 100644[m
[1m--- a/app/(tabs)/_layout.tsx[m
[1m+++ b/app/(tabs)/_layout.tsx[m
[36m@@ -2,7 +2,7 @@[m [mimport { RootState } from "@/store";[m
 import { Tabs, useSegments } from "expo-router";[m
 import { useSelector } from "react-redux";[m
 import { CustomTabBar } from "../../components/CustomTabBar";[m
[31m-import { ShopTabBar } from "../../components/ShopTabBar";[m
[32m+[m[32mimport ShopTabBar from "../../components/ShopTabBar";[m
 [m
 export default function TabsLayout() {[m
   const segments = useSegments();[m
[1mdiff --git a/app/(tabs)/admin/subscriptions.tsx b/app/(tabs)/admin/subscriptions.tsx[m
[1mindex 5c0d4fc4..9b8d3c60 100644[m
[1m--- a/app/(tabs)/admin/subscriptions.tsx[m
[1m+++ b/app/(tabs)/admin/subscriptions.tsx[m
[36m@@ -26,28 +26,7 @@[m [mimport {[m
   useMarkSubscriptionDailyDoneMutation,[m
 } from "../../../store/api/subscriptionApi";[m
 [m
[31m-const MOCK_WORKERS = [[m
[31m-  {[m
[31m-    id: "65a000000000000000000001",[m
[31m-    name: "Amit Sharma",[m
[31m-    phone: "+919876543210",[m
[31m-  },[m
[31m-  {[m
[31m-    id: "65a000000000000000000002",[m
[31m-    name: "Rahul Verma",[m
[31m-    phone: "+918765432109",[m
[31m-  },[m
[31m-  {[m
[31m-    id: "65a000000000000000000003",[m
[31m-    name: "Suresh Singh",[m
[31m-    phone: "+917654321098",[m
[31m-  },[m
[31m-  {[m
[31m-    id: "65a000000000000000000004",[m
[31m-    name: "Vikram Yadav",[m
[31m-    phone: "+916543210987",[m
[31m-  },[m
[31m-];[m
[32m+[m[32mimport { useGetWorkersQuery } from "@/store/api/workerApi";[m
 [m
 export default function AdminSubscriptionsScreen() {[m
   const router = useRouter();[m
[36m@@ -55,6 +34,9 @@[m [mexport default function AdminSubscriptionsScreen() {[m
   const [workerModalVisible, setWorkerModalVisible] = useState(false);[m
   const [selectedSub, setSelectedSub] = useState<any>(null);[m
 [m
[32m+[m[32m  const { data: workersData } = useGetWorkersQuery({});[m
[32m+[m[32m  const workers = workersData?.workers || [];[m
[32m+[m
   const getStatusQuery = (label: string) => {[m
     switch (label) {[m
       case "Requests":[m
[36m@@ -103,7 +85,7 @@[m [mexport default function AdminSubscriptionsScreen() {[m
             try {[m
               await assignWorker({[m
                 subscriptionId: selectedSub._id,[m
[31m-                workerId: worker.id,[m
[32m+[m[32m                workerId: worker._id,[m
                 workerName: worker.name,[m
                 workerPhone: worker.phone,[m
               }).unwrap();[m
[36m@@ -407,20 +389,38 @@[m [mexport default function AdminSubscriptionsScreen() {[m
           />[m
           <View style={styles.modalContent}>[m
             <Text style={styles.modalTitle}>Select Worker</Text>[m
[31m-            {MOCK_WORKERS.map((worker) => ([m
[32m+[m[32m            {workers.map((worker) => ([m
               <TouchableOpacity[m
[31m-                key={worker.id}[m
[32m+[m[32m                key={worker._id}[m
                 style={styles.workerRow}[m
                 onPress={() => handleAssignWorker(worker)}[m
               >[m
                 <View style={styles.workerInitial}>[m
[31m-                  <Text style={{ fontWeight: "bold" }}>[m
[31m-                    {worker.name.charAt(0)}[m
[31m-                  </Text>[m
[32m+[m[32m                  {worker.profileImage ? ([m
[32m+[m[32m                    <Image[m
[32m+[m[32m                      source={{ uri: worker.profileImage }}[m
[32m+[m[32m                      style={{ width: 36, height: 36, borderRadius: 18 }}[m
[32m+[m[32m                    />[m
[32m+[m[32m                  ) : ([m
[32m+[m[32m                    <Text style={{ fontWeight: "bold" }}>[m
[32m+[m[32m                      {worker.name.charAt(0)}[m
[32m+[m[32m                    </Text>[m
[32m+[m[32m                  )}[m
                 </View>[m
                 <View>[m
                   <Text style={styles.workerName}>{worker.name}</Text>[m
                   <Text style={styles.workerPhone}>{worker.phone}</Text>[m
[32m+[m[32m                  <Text[m
[32m+[m[32m                    style={[[m
[32m+[m[32m                      styles.workerPhone,[m
[32m+[m[32m                      {[m
[32m+[m[32m                        fontSize: 10,[m
[32m+[m[32m                        color: worker.status === "Active" ? "green" : "gray",[m
[32m+[m[32m                      },[m
[32m+[m[32m                    ]}[m
[32m+[m[32m                  >[m
[32m+[m[32m                    {worker.status}[m
[32m+[m[32m                  </Text>[m
                 </View>[m
               </TouchableOpacity>[m
             ))}[m
[1mdiff --git a/app/(tabs)/bookings/_layout.tsx b/app/(tabs)/bookings/_layout.tsx[m
[1mindex 669ebce9..61b5ea8a 100644[m
[1m--- a/app/(tabs)/bookings/_layout.tsx[m
[1m+++ b/app/(tabs)/bookings/_layout.tsx[m
[36m@@ -1,21 +1,8 @@[m
 import { RootState } from "@/store";[m
[31m-import {[m
[31m-  useGetBookingsQuery,[m
[31m-  useUpdateBookingStatusMutation,[m
[31m-} from "@/store/api/bookingApi";[m
 import { Ionicons } from "@expo/vector-icons";[m
 import { Slot, usePathname, useRouter } from "expo-router";[m
[31m-import { useState } from "react";[m
 import {[m
[31m-  ActivityIndicator,[m
[31m-  Alert,[m
[31m-  FlatList,[m
[31m-  Image,[m
[31m-  Linking,[m
[31m-  Modal,[m
[31m-  RefreshControl,[m
   SafeAreaView,[m
[31m-  ScrollView,[m
   StyleSheet,[m
   Text,[m
   TouchableOpacity,[m
[36m@@ -23,550 +10,6 @@[m [mimport {[m
 } from "react-native";[m
 import { useSelector } from "react-redux";[m
 [m
[31m-// --- MOCK WORKERS (will add separate API later) ---[m
[31m-const MOCK_WORKERS = [[m
[31m-  { id: "W1", name: "Amit Sharma", phone: "+919876543210" },[m
[31m-  { id: "W2", name: "Rahul Verma", phone: "+918765432109" },[m
[31m-  { id: "W3", name: "Suresh Singh", phone: "+917654321098" },[m
[31m-  { id: "W4", name: "Vikram Yadav", phone: "+916543210987" },[m
[31m-];[m
[31m-[m
[31m-const formatTime = (hour: number): string => {[m
[31m-  if (hour === 0) return "12:00 AM";[m
[31m-  if (hour === 12) return "12:00 PM";[m
[31m-  if (hour < 12) return `${hour}:00 AM`;[m
[31m-  return `${hour - 12}:00 PM`;[m
[31m-};[m
[31m-[m
[31m-const mapBookingToUI = (booking: any) => {[m
[31m-  const serviceName =[m
[31m-    booking.serviceName ||[m
[31m-    booking.washPackage?.name ||[m
[31m-    (typeof booking.washPackage === "string"[m
[31m-      ? null[m
[31m-      : booking.washPackage?.name) ||[m
[31m-    "Unknown Service";[m
[31m-[m
[31m-  return {[m
[31m-    id: booking._id,[m
[31m-    customerName: booking.user?.name || "Customer",[m
[31m-    time: formatTime(booking.bookingTime),[m
[31m-    status: booking.status?.toUpperCase() || "PENDING",[m
[31m-    car: `${booking.vehicleType || booking.vehicle?.type || "Car"} (${[m
[31m-      booking.vehicleNo || booking.vehicle?.number || "N/A"[m
[31m-    })`,[m
[31m-    license: booking.vehicleNo || booking.vehicle?.number || "N/A",[m
[31m-    service: serviceName,[m
[31m-    avatar:[m
[31m-      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",[m
[31m-    phone: booking.user?.phone ? `91${booking.user.phone}` : "",[m
[31m-    address: booking.locality[m
[31m-      ? `${booking.houseOrFlatNo || ""}, ${booking.locality}, ${[m
[31m-          booking.city || ""[m
[31m-        }`.replace(/^, /, "")[m
[31m-      : booking.address?.locality[m
[31m-        ? `${booking.address.houseOrFlatNo || ""}, ${booking.address.locality}`[m
[31m-        : "Address not provided",[m
[31m-    price: booking.price,[m
[31m-    bookingDate: booking.bookingDate,[m
[31m-  };[m
[31m-};[m
[31m-[m
[31m-const getNextSevenDays = () => {[m
[31m-  const dates = [];[m
[31m-  const today = new Date();[m
[31m-[m
[31m-  for (let i = 0; i < 7; i++) {[m
[31m-    const d = new Date(today);[m
[31m-    d.setDate(today.getDate() + i);[m
[31m-    dates.push({[m
[31m-      day: d.toLocaleDateString("en-US", { weekday: "short" }),[m
[31m-      date: d.getDate().toString(),[m
[31m-      fullDate: d,[m
[31m-      active: i === 0,[m
[31m-    });[m
[31m-  }[m
[31m-  return dates;[m
[31m-};[m
[31m-[m
[31m-function AdminBookingsScreen() {[m
[31m-  const [filter, setFilter] = useState("All");[m
[31m-  const [dates] = useState(getNextSevenDays());[m
[31m-  const [workerModalVisible, setWorkerModalVisible] = useState(false);[m
[31m-  const [selectedBooking, setSelectedBooking] = useState<any>(null);[m
[31m-[m
[31m-  const {[m
[31m-    data: bookingsResponse,[m
[31m-    isLoading,[m
[31m-    error,[m
[31m-    refetch,[m
[31m-  } = useGetBookingsQuery({ page: 1, perPage: 100 });[m
[31m-  const [updateBookingStatus, { isLoading: isUpdatingStatus }] =[m
[31m-    useUpdateBookingStatusMutation();[m
[31m-[m
[31m-  const bookingList = bookingsResponse?.data?.bookingList || [];[m
[31m-  const bookings = bookingList[m
[31m-    .filter((booking: any) => {[m
[31m-      const status = booking.status?.toLowerCase();[m
[31m-      return !["pending", "failed"].includes(status);[m
[31m-    })[m
[31m-    .map((booking: any) => mapBookingToUI(booking));[m
[31m-[m
[31m-  const filteredBookings = bookings.filter([m
[31m-    (booking: ReturnType<typeof mapBookingToUI>) => {[m
[31m-      if (filter === "Pending")[m
[31m-        return ([m
[31m-          booking.status === "PENDING" ||[m
[31m-          booking.status === "IN-PROGRESS" ||[m
[31m-          booking.status === "CONFIRMED"[m
[31m-        );[m
[31m-      if (filter === "Completed") return booking.status === "COMPLETED";[m
[31m-      return true;[m
[31m-    },[m
[31m-  );[m
[31m-[m
[31m-  const handleAssignWorker = async (worker: any) => {[m
[31m-    setWorkerModalVisible(false);[m
[31m-[m
[31m-    Alert.alert([m
[31m-      "Confirm Assignment",[m
[31m-      `Assign ${worker.name} to ${selectedBooking?.customerName}?`,[m
[31m-      [[m
[31m-        { text: "Cancel", style: "cancel" },[m
[31m-        {[m
[31m-          text: "Confirm & Notify",[m
[31m-          onPress: async () => {[m
[31m-            try {[m
[31m-              await updateBookingStatus({[m
[31m-                id: selectedBooking.id,[m
[31m-                status: "Pending",[m
[31m-                workerName: worker.name,[m
[31m-                workerPhone: worker.phone,[m
[31m-              }).unwrap();[m
[31m-[m
[31m-              const userMsg = `Hello ${selectedBooking.customerName}, your service for ${selectedBooking.car} has been assigned to ${worker.name} (Ph: ${worker.phone}). They will arrive shortly.`;[m
[31m-              const userUrl = `https://wa.me/${[m
[31m-                selectedBooking.phone[m
[31m-              }?text=${encodeURIComponent(userMsg)}`;[m
[31m-[m
[31m-              Linking.openURL(userUrl).catch(() => {[m
[31m-                Alert.alert("Error", "Could not open WhatsApp");[m
[31m-              });[m
[31m-[m
[31m-              setTimeout(() => {[m
[31m-                Alert.alert([m
[31m-                  "Notify Worker",[m
[31m-                  "Send job details to the worker now?",[m
[31m-                  [[m
[31m-                    { text: "Skip", style: "cancel", onPress: () => refetch() },[m
[31m-                    {[m
[31m-                      text: "Send to Worker",[m
[31m-                      onPress: () => {[m
[31m-                        const workerPhone = worker.phone.replace(/[^0-9]/g, "");[m
[31m-                        const workerMsg = `🛠 *New Job Assigned!*\n\n👤 Client: ${selectedBooking.customerName}\n🚗 Car: ${selectedBooking.car} (${selectedBooking.license})\n📋 Service: ${selectedBooking.service}\n⏰ Time: ${selectedBooking.time}\n📍 Address: ${selectedBooking.address}\n📞 Phone: ${selectedBooking.phone}`;[m
[31m-                        const workerUrl = `https://wa.me/${workerPhone}?text=${encodeURIComponent([m
[31m-                          workerMsg,[m
[31m-                        )}`;[m
[31m-                        Linking.openURL(workerUrl).catch(() =>[m
[31m-                          Alert.alert([m
[31m-                            "Error",[m
[31m-                            "Could not open WhatsApp for Worker",[m
[31m-                          ),[m
[31m-                        );[m
[31m-                        refetch();[m
[31m-                      },[m
[31m-                    },[m
[31m-                  ],[m
[31m-                );[m
[31m-              }, 1000);[m
[31m-            } catch (err) {[m
[31m-              console.error("Failed to update booking status:", err);[m
[31m-              Alert.alert([m
[31m-                "Error",[m
[31m-                "Failed to assign worker. Please try again.",[m
[31m-              );[m
[31m-            }[m
[31m-          },[m
[31m-        },[m
[31m-      ],[m
[31m-    );[m
[31m-  };[m
[31m-[m
[31m-  const handleMarkComplete = async ([m
[31m-    booking: ReturnType<typeof mapBookingToUI>,[m
[31m-  ) => {[m
[31m-    Alert.alert([m
[31m-      "Mark as Complete",[m
[31m-      `Mark this booking for ${booking.customerName} as completed?`,[m
[31m-      [[m
[31m-        { text: "Cancel", style: "cancel" },[m
[31m-        {[m
[31m-          text: "Complete",[m
[31m-          onPress: async () => {[m
[31m-            try {[m
[31m-              await updateBookingStatus({[m
[31m-                id: booking.id,[m
[31m-                status: "Completed",[m
[31m-              }).unwrap();[m
[31m-              Alert.alert("Success", "Booking marked as completed!");[m
[31m-              refetch();[m
[31m-            } catch (err) {[m
[31m-              console.error("Failed to mark complete:", err);[m
[31m-              Alert.alert("Error", "Failed to update booking status.");[m
[31m-            }[m
[31m-          },[m
[31m-        },[m
[31m-      ],[m
[31m-    );[m
[31m-  };[m
[31m-[m
[31m-  const currentMonthYear = new Date().toLocaleDateString("en-US", {[m
[31m-    month: "long",[m
[31m-    year: "numeric",[m
[31m-  });[m
[31m-[m
[31m-  const handleWhatsApp = (phone: string, name: string) => {[m
[31m-    Alert.alert([m
[31m-      "Open WhatsApp",[m
[31m-      `Are you sure you want to contact ${name} on WhatsApp?`,[m
[31m-      [[m
[31m-        {[m
[31m-          text: "Cancel",[m
[31m-          style: "cancel",[m
[31m-        },[m
[31m-        {[m
[31m-          text: "Open",[m
[31m-          onPress: () => {[m
[31m-            const url = `whatsapp://send?phone=${phone}&text=Hello ${name}, regarding your car service booking...`;[m
[31m-            Linking.openURL(url).catch(() => alert("WhatsApp not installed"));[m
[31m-          },[m
[31m-        },[m
[31m-      ],[m
[31m-    );[m
[31m-  };[m
[31m-[m
[31m-  const getStatusBadgeStyle = (status: string) => {[m
[31m-    switch (status) {[m
[31m-      case "COMPLETED":[m
[31m-        return { backgroundColor: "#dcfce7", borderColor: "#86efac" };[m
[31m-      case "PENDING":[m
[31m-      case "IN-PROGRESS":[m
[31m-        return { backgroundColor: "#fef9c3", borderColor: "#fde047" };[m
[31m-      default:[m
[31m-        return { backgroundColor: "#e8f5e9", borderColor: "#a5d6a7" }; // CONFIRMED[m
[31m-    }[m
[31m-  };[m
[31m-[m
[31m-  const renderCard = ({[m
[31m-    item,[m
[31m-  }: {[m
[31m-    item: ReturnType<typeof mapBookingToUI>;[m
[31m-  }) => {[m
[31m-    const isAssigned =[m
[31m-      item.status === "PENDING" || item.status === "IN-PROGRESS";[m
[31m-    const isCompleted = item.status === "COMPLETED";[m
[31m-[m
[31m-    return ([m
[31m-      <View style={adminStyles.card}>[m
[31m-        <View style={adminStyles.cardHeader}>[m
[31m-          <View style={adminStyles.userInfo}>[m
[31m-            <Image source={{ uri: item.avatar }} style={adminStyles.avatar} />[m
[31m-            <View>[m
[31m-              <Text style={adminStyles.userName}>{item.customerName}</Text>[m
[31m-              <View style={adminStyles.timeRow}>[m
[31m-                <Ionicons name="time" size={12} color="#007BFF" />[m
[31m-                <Text style={adminStyles.timeText}>{item.time}</Text>[m
[31m-              </View>[m
[31m-            </View>[m
[31m-          </View>[m
[31m-          <View[m
[31m-            style={[adminStyles.statusBadge, getStatusBadgeStyle(item.status)]}[m
[31m-          >[m
[31m-            <View[m
[31m-              style={[[m
[31m-                adminStyles.statusDot,[m
[31m-                isCompleted && { backgroundColor: "#22c55e" },[m
[31m-                isAssigned && { backgroundColor: "#eab308" },[m
[31m-              ]}[m
[31m-            />[m
[31m-            <Text style={adminStyles.statusText}>{item.status}</Text>[m
[31m-          </View>[m
[31m-        </View>[m
[31m-[m
[31m-        {/* Details */}[m
[31m-        <View style={adminStyles.detailsContainer}>[m
[31m-          <View style={adminStyles.detailRow}>[m
[31m-            <Ionicons[m
[31m-              name="car-sport-outline"[m
[31m-              size={16}[m
[31m-              color="#666"[m
[31m-              style={adminStyles.detailIcon}[m
[31m-            />[m
[31m-            <View>[m
[31m-              <Text style={adminStyles.detailTitle}>{item.car}</Text>[m
[31m-              <Text style={adminStyles.detailSub}>{item.license}</Text>[m
[31m-            </View>[m
[31m-          </View>[m
[31m-          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>[m
[31m-            <Ionicons[m
[31m-              name="water-outline"[m
[31m-              size={16}[m
[31m-              color="#666"[m
[31m-              style={adminStyles.detailIcon}[m
[31m-            />[m
[31m-            <Text style={adminStyles.detailTitle}>{item.service}</Text>[m
[31m-          </View>[m
[31m-          {/* Address */}[m
[31m-          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>[m
[31m-            <Ionicons[m
[31m-              name="location-outline"[m
[31m-              size={16}[m
[31m-              color="#666"[m
[31m-              style={adminStyles.detailIcon}[m
[31m-            />[m
[31m-            <Text[m
[31m-              style={[adminStyles.detailTitle, { flex: 1 }]}[m
[31m-              numberOfLines={2}[m
[31m-            >[m
[31m-              {item.address}[m
[31m-            </Text>[m
[31m-          </View>[m
[31m-          {/* Phone */}[m
[31m-          {item.phone && ([m
[31m-            <TouchableOpacity[m
[31m-              style={[adminStyles.detailRow, { marginTop: 12 }]}[m
[31m-              onPress={() => {[m
[31m-                const phoneUrl = `tel:+${item.phone}`;[m
[31m-                Linking.openURL(phoneUrl).catch(() =>[m
[31m-                  Alert.alert("Error", "Could not open dialer"),[m
[31m-                );[m
[31m-              }}[m
[31m-            >[m
[31m-              <Ionicons[m
[31m-                name="call-outline"[m
[31m-                size={16}[m
[31m-                color="#007BFF"[m
[31m-                style={adminStyles.detailIcon}[m
[31m-              />[m
[31m-              <Text style={[adminStyles.detailTitle, { color: "#007BFF" }]}>[m
[31m-                +{item.phone}[m
[31m-              </Text>[m
[31m-            </TouchableOpacity>[m
[31m-          )}[m
[31m-        </View>[m
[31m-[m
[31m-        {/* Action Buttons - Conditional based on status */}[m
[31m-        {!isAssigned && !isCompleted && ([m
[31m-          <TouchableOpacity[m
[31m-            style={[adminStyles.whatsappButton, { backgroundColor: "#1a1a1a" }]}[m
[31m-            onPress={() => {[m
[31m-              setSelectedBooking(item);[m
[31m-              setWorkerModalVisible(true);[m
[31m-            }}[m
[31m-          >[m
[31m