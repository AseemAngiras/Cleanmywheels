import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
  Linking,
  Modal,
  StyleSheet,
  BackHandler,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useGetWorkersQuery, useGetWorkerScheduleQuery } from "@/store/api/workerApi";
import Animated, { FadeInDown, FadeInUp, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "@/utils/toast";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function WorkerTrackingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (selectedWorkerId) {
          setSelectedWorkerId(null);
          return true;
        }
        router.replace("/dashboard");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [selectedWorkerId])
  );
  
  const { data: workersData, isLoading: isLoadingWorkers } = useGetWorkersQuery({ limit: 100 });
  const workers = workersData?.workers || [];

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery)
    );
  }, [workers, searchQuery]);

  const { data: scheduleData, isLoading: isLoadingSchedule } = 
    useGetWorkerScheduleQuery(selectedWorkerId || "", { skip: !selectedWorkerId });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const categorizedSchedule = useMemo(() => {
    if (!scheduleData) return { ongoing: [], upcoming: [], history: [] };

    const allTasks = [
      ...scheduleData.bookings.map(b => ({ ...b, taskType: 'BOOKING' })),
      ...scheduleData.subscriptions.map(s => ({ ...s, taskType: 'SUBSCRIPTION' }))
    ];

    const ongoing: any[] = [];
    const upcoming: any[] = [];
    const history: any[] = [];

    allTasks.forEach(task => {
      const taskDate = task.taskType === 'BOOKING' 
        ? new Date(task.bookingDate) 
        : new Date(task.createdAt);

      const status = task.status.toLowerCase();
      
      if (status === 'completed' || status === 'cancelled' || status === 'expired') {
        history.push(task);
      } else if (status === 'ongoing' || (status === 'confirmed' && isToday(taskDate))) {
        ongoing.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { ongoing, upcoming, history };
  }, [scheduleData]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getFullAddress = (item: any) => {
    const addr = item.address;
    if (addr && typeof addr === "object") {
      return `${addr.houseOrFlatNo || ""}, ${addr.locality || ""}, ${addr.city || ""}`
        .trim()
        .replace(/^, /, "")
        .replace(/, $/, "");
    }
    if (item.locality) {
      return `${item.houseOrFlatNo || ""}, ${item.locality || ""}, ${item.city || ""}`
        .trim()
        .replace(/^, /, "")
        .replace(/, $/, "");
    }
    return item.fullAddress || "No address provided";
  };

  const renderWorkerListItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedWorkerId(item._id)}
      className="bg-card mx-5 mb-3 p-4 rounded-3xl border border-border flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full bg-background items-center justify-center border border-border">
          <Ionicons name="person" size={20} color={Colors.primary} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-text font-[700] text-[15px]">{item.name}</Text>
          <Text className="text-textSecondary text-[12px]">{item.jobRole || "Professional"}</Text>
          <Text className="text-primary text-[11px] font-[600] mt-0.5">{item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => handleCall(item.phone)}
        className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20"
      >
        <Ionicons name="call" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const TaskCard = ({ task }: { task: any }) => {
    const isBooking = task.taskType === 'BOOKING';
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setSelectedTask(task)}
        className="bg-card rounded-2xl p-4 mb-4 border border-border shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isBooking ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
              <Ionicons 
                name={isBooking ? "calendar" : "repeat"} 
                size={16} 
                color={isBooking ? "#3B82F6" : "#A855F7"} 
              />
            </View>
            <View>
              <Text className="text-text font-[700] text-[14px]">
                {isBooking ? (task.washPackage?.name || "One-time Wash") : (task.plan?.name || "Subscription")}
              </Text>
              <Text className="text-textSecondary text-[11px]">
                {isBooking ? task.timeSlot : task.timeSlot || "Standard Time"}
              </Text>
            </View>
          </View>
          <View className={`px-2 py-1 rounded-lg ${getStatusColor(task.status)}`}>
            <Text className="text-[9px] font-[800] uppercase text-white">
              {task.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="car-sport-outline" size={14} color={Colors.textSecondary} />
          <Text className="text-textSecondary text-[12px] ml-2 font-[500]">
            {task.vehicle?.brand} {task.vehicle?.model} • {task.vehicle?.vehicleNo}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text numberOfLines={1} className="text-textSecondary text-[12px] ml-2 flex-1">
            {getFullAddress(task)}
          </Text>
        </View>
        
        <View className="mt-4 pt-3 border-t border-border/50 flex-row justify-between items-center">
           <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-full bg-background items-center justify-center mr-2">
                 <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
              </View>
              <Text className="text-textSecondary text-[11px]">{task.user?.name || "Customer"}</Text>
           </View>
           <Text className="text-primary text-[10px] font-[800] uppercase">View Details</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === 'completed' || status === 'active') return 'bg-green-500';
    if (status === 'cancelled' || status === 'expired') return 'bg-red-500';
    if (status === 'ongoing' || status === 'confirmed') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const TaskDetailsModal = () => {
    if (!selectedTask) return null;
    const isBooking = selectedTask.taskType === 'BOOKING';

    return (
      <Modal
        visible={!!selectedTask}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setSelectedTask(null)}
            className="absolute inset-0 bg-black/60"
          />
          <Animated.View 
            entering={FadeInUp}
            className="bg-card rounded-t-[40px] p-8 border-t border-border"
            style={{ maxHeight: height * 0.85, paddingBottom: insets.bottom + 20 }}
          >
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-border rounded-full mb-6" />
              <Text className="text-[22px] font-[700] text-text">
                {isBooking ? "Booking Details" : "Subscription Log"}
              </Text>
              <Text className="text-[14px] color-textSecondary text-center mt-1">
                {isBooking ? "Complete breakdown of the assigned wash task" : "History of all recurring services for this vehicle"}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              {/* Common Info */}
              <View className="flex-row items-center justify-between p-4 bg-background rounded-3xl border border-border mb-6">
                 <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-card items-center justify-center border border-border">
                       <Ionicons name="car" size={24} color={Colors.primary} />
                    </View>
                    <View className="ml-4">
                       <Text className="text-text font-[700] text-[16px]">
                          {selectedTask.vehicle?.brand} {selectedTask.vehicle?.model}
                       </Text>
                       <Text className="text-textSecondary text-[13px]">
                          {selectedTask.vehicle?.vehicleNo} • {selectedTask.vehicle?.color}
                       </Text>
                    </View>
                 </View>
                 <View className={`px-3 py-1.5 rounded-xl ${getStatusColor(selectedTask.status)}`}>
                    <Text className="text-white text-[10px] font-[800] uppercase">
                       {selectedTask.status}
                    </Text>
                 </View>
              </View>

              {/* Customer Info */}
              <View className="mb-6">
                <Text className="text-textSecondary text-[11px] font-[800] uppercase tracking-widest mb-3 ml-1">
                  Customer & Contact
                </Text>
                <View className="bg-background rounded-3xl p-4 border border-border">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-card items-center justify-center">
                        <Ionicons name="person" size={18} color={Colors.textSecondary} />
                      </View>
                      <View className="ml-3">
                        <Text className="text-text font-[600]">{selectedTask.user?.name}</Text>
                        <Text className="text-textSecondary text-[12px]">{selectedTask.user?.phone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL(`tel:${selectedTask.user?.phone}`)}
                      className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                    >
                      <Ionicons name="call" size={18} color="black" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-start">
                     <Ionicons name="location" size={18} color={Colors.textSecondary} className="mt-0.5" />
                     <Text className="text-textSecondary text-[13px] ml-2 flex-1 leading-5">
                        {getFullAddress(selectedTask)}
                     </Text>
                  </View>
                </View>
              </View>

              {/* Service Specifics */}
              {isBooking ? (
                <View className="mb-6">
                  <Text className="text-textSecondary text-[11px] font-[800] uppercase tracking-widest mb-3 ml-1">
                    Wash Package
                  </Text>
                  <View className="bg-background rounded-3xl p-5 border border-border">
                     <Text className="text-primary text-[18px] font-[800] mb-1">
                        {selectedTask.washPackage?.name}
                     </Text>
                     <Text className="text-textSecondary text-[14px] mb-4">
                        Scheduled for: {new Date(selectedTask.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                     </Text>
                     
                     <View className="flex-row flex-wrap gap-2">
                        {selectedTask.washPackage?.features?.map((f: string, i: number) => (
                          <View key={i} className="bg-card px-3 py-1.5 rounded-xl border border-border">
                             <Text className="text-textSecondary text-[11px]">{f}</Text>
                          </View>
                        ))}
                     </View>
                  </View>
                </View>
              ) : (
                <View className="mb-6">
                   <Text className="text-textSecondary text-[11px] font-[800] uppercase tracking-widest mb-3 ml-1">
                     Subscription Plan
                   </Text>
                   <View className="bg-background rounded-3xl p-5 border border-border mb-4">
                      <Text className="text-purple-400 text-[18px] font-[800] mb-1">
                         {selectedTask.plan?.name}
                      </Text>
                      <Text className="text-textSecondary text-[14px]">
                         Active since: {new Date(selectedTask.createdAt).toLocaleDateString()}
                      </Text>
                   </View>
                   
                   <Text className="text-textSecondary text-[11px] font-[800] uppercase tracking-widest mb-3 ml-1">
                      Service Logs
                   </Text>
                   <View className="bg-background rounded-3xl p-4 border border-border">
                      {selectedTask.serviceDates?.length > 0 ? (
                        [...selectedTask.serviceDates]
                          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .reverse()
                          .map((date: any, i: number, arr: any[]) => (
                          <View key={i} className={`flex-row items-center justify-between py-3 ${i !== arr.length - 1 ? 'border-b border-border/50' : ''}`}>
                             <View className="flex-row items-center">
                                <View className={`w-2 h-2 rounded-full mr-3 ${new Date(date.date) < new Date() || date.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <Text className="text-text text-[13px] font-[500]">
                                   {new Date(date.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                             </View>
                             <Text className="text-textSecondary text-[12px] uppercase font-[700]">
                                {date.status || (new Date(date.date) < new Date() ? 'COMPLETED' : 'UPCOMING')}
                             </Text>
                          </View>
                        ))
                      ) : (
                        <Text className="text-textSecondary text-center py-4 italic">No service logs available yet.</Text>
                      )}
                   </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setSelectedTask(null)}
              className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary"
            >
               <Text className="text-black font-[800] text-base">CLOSE DETAILS</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background} statusBarStyle="light-content">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-4 bg-card border-b border-border/50">
          <TouchableOpacity
            onPress={() => selectedWorkerId ? setSelectedWorkerId(null) : router.replace("/profile")}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-[20px] font-[700] color-text">
              {selectedWorkerId ? "Professional Details" : "Worker Tracking"}
            </Text>
            <Text className="text-[11px] color-textSecondary font-[600] uppercase tracking-widest">
              {selectedWorkerId ? "Deployment Log" : "Live Timetable"}
            </Text>
          </View>
        </View>

        {!selectedWorkerId ? (
          <View className="flex-1">
            {/* Search Bar */}
            <View className="px-5 py-4">
              <View className="bg-card flex-row items-center px-4 py-3 rounded-2xl border border-border">
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput
                  placeholder="Search by name or phone..."
                  placeholderTextColor={Colors.textSecondary}
                  className="flex-1 ml-3 text-text font-[500]"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isLoadingWorkers ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color={Colors.primary} size="large" />
              </View>
            ) : (
              <FlatList
                data={filteredWorkers}
                renderItem={renderWorkerListItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View className="py-20 items-center justify-center px-10">
                    <Ionicons name="people-outline" size={48} color={Colors.textSecondary} style={{ opacity: 0.2 }} />
                    <Text className="text-textSecondary text-center mt-4 font-[600]">
                      No professionals found matching your search.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
             {/* Selected Worker Info Bar */}
             <Animated.View entering={FadeInDown} className="bg-card/30 p-5 border-b border-border/30">
                <View className="flex-row items-center justify-between">
                   <View className="flex-row items-center">
                      <View className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border">
                         <Ionicons name="person" size={24} color={Colors.primary} />
                      </View>
                      <View className="ml-4">
                         <Text className="text-[18px] font-[700] text-text">
                            {scheduleData?.worker?.name}
                         </Text>
                         <Text className="text-textSecondary text-[13px]">
                            {scheduleData?.worker?.phone}
                         </Text>
                      </View>
                   </View>
                   <TouchableOpacity 
                     onPress={() => handleCall(scheduleData?.worker?.phone)}
                     className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
                   >
                      <Ionicons name="call" size={16} color="black" />
                      <Text className="text-black font-[800] ml-2">CONTACT</Text>
                   </TouchableOpacity>
                </View>
             </Animated.View>

            {isLoadingSchedule ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text className="text-textSecondary mt-4 font-[600]">Fetching schedule...</Text>
              </View>
            ) : scheduleData ? (
              <View className="px-5 mt-6">
                
                {/* Stats Overview */}
                <View className="flex-row gap-3 mb-8">
                  <View className="flex-1 bg-card p-4 rounded-3xl border border-border items-center">
                    <Text className="text-primary text-[24px] font-[900]">{categorizedSchedule.ongoing.length}</Text>
                    <Text className="text-textSecondary text-[10px] font-[700] uppercase mt-1">Ongoing</Text>
                  </View>
                  <View className="flex-1 bg-card p-4 rounded-3xl border border-border items-center">
                    <Text className="text-blue-500 text-[24px] font-[900]">{categorizedSchedule.upcoming.length}</Text>
                    <Text className="text-textSecondary text-[10px] font-[700] uppercase mt-1">Upcoming</Text>
                  </View>
                  <View className="flex-1 bg-card p-4 rounded-3xl border border-border items-center">
                    <Text className="text-textSecondary text-[24px] font-[900]">{categorizedSchedule.history.length}</Text>
                    <Text className="text-textSecondary text-[10px] font-[700] uppercase mt-1">Past</Text>
                  </View>
                </View>

                {/* Ongoing Tasks */}
                {categorizedSchedule.ongoing.length > 0 && (
                  <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                      <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                      <Text className="text-text font-[800] text-[16px]">Ongoing Deployment</Text>
                    </View>
                    {categorizedSchedule.ongoing.map((task, i) => (
                      <TaskCard key={`ongoing-${i}`} task={task} />
                    ))}
                  </View>
                )}

                {/* Upcoming Tasks */}
                <View className="mb-8">
                  <Text className="text-text font-[800] text-[16px] mb-4">Upcoming Schedule</Text>
                  {categorizedSchedule.upcoming.length === 0 ? (
                    <View className="bg-card/50 rounded-2xl p-6 items-center border border-dashed border-border">
                      <Ionicons name="calendar-outline" size={32} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
                      <Text className="text-textSecondary text-[13px] mt-2 font-[500]">No upcoming tasks scheduled</Text>
                    </View>
                  ) : (
                    categorizedSchedule.upcoming.map((task, i) => (
                      <TaskCard key={`upcoming-${i}`} task={task} />
                    ))
                  )}
                </View>

                {/* Past Works */}
                <View>
                  <Text className="text-text font-[800] text-[16px] mb-4">Service History</Text>
                  {categorizedSchedule.history.length === 0 ? (
                    <Text className="text-textSecondary text-[13px] ml-1">No history found</Text>
                  ) : (
                    categorizedSchedule.history.map((task, i) => (
                      <TaskCard key={`history-${i}`} task={task} />
                    ))
                  )}
                </View>
              </View>
            ) : null}
          </ScrollView>
        )}
        <TaskDetailsModal />
      </View>
    </ScreenWrapper>
  );
}
