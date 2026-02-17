"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";

import {
  useAssignSubscriptionWorkerMutation,
  useGetAllSubscriptionsQuery,
  useMarkSubscriptionDailyDoneMutation,
} from "../../../store/api/subscriptionApi";

import { useGetWorkersQuery } from "@/store/api/workerApi";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function AdminSubscriptionsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("Requests");
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const { data: workersData } = useGetWorkersQuery({});
  const workers = workersData?.workers || [];

  const getStatusQuery = (label: string) => {
    switch (label) {
      case "Requests":
        return "active";
      case "Ongoing":
        return "ongoing";
      default:
        return undefined;
    }
  };

  const {
    data: subsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllSubscriptionsQuery({
    page: 1,
    perPage: 100,
    status: getStatusQuery(filter),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [assignWorker, { isLoading: isAssigning }] =
    useAssignSubscriptionWorkerMutation();

  const subscriptions = subsResponse?.subscriptions || [];

  const handleAssignWorker = async (worker: any) => {
    setWorkerModalVisible(false);
    if (!selectedSub) return;

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to ${selectedSub.user?.name}'s subscription?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await assignWorker({
                subscriptionId: selectedSub._id,
                workerId: worker._id,
                workerName: worker.name,
                workerPhone: worker.phone,
              }).unwrap();

              Alert.alert("Success", "Worker assigned successfully!");
              refetch();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.data?.message || "Failed to assign worker.",
              );
            }
          },
        },
      ],
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const [markDailyDone] = useMarkSubscriptionDailyDoneMutation();

  const handleMarkDone = async (id: string) => {
    Alert.alert(
      "Confirm Service",
      "Are you sure you want to mark today's service as done?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await markDailyDone({ subscriptionId: id }).unwrap();
              Alert.alert("Success", "Service marked as done for today!");
              refetch();
            } catch (err) {
              Alert.alert("Error", "Failed to mark service as done.");
            }
          },
        },
      ],
    );
  };

  const handleNotifyWorker = (item: any) => {
    const workerPhone = item.worker?.phone || item.workerPhone;
    if (!workerPhone) return Alert.alert("Error", "Worker phone not found");

    const startDate = new Date(item.startDate);
    const completed = item.servicesCompleted || 0;
    const nextServiceDate = new Date(startDate);
    nextServiceDate.setDate(startDate.getDate() + completed);

    const dateStr = nextServiceDate.toDateString();

    const addons = (item.nextServiceAddons || []).filter((a: any) => {
      if (!a.serviceDate) return true;
      const sDate = new Date(a.serviceDate).toDateString();
      const todayStr = new Date().toDateString();
      return sDate === dateStr || sDate === todayStr;
    });

    const formattedAddons = addons.map((a: any) => `- ${a.name} (Paid)`);
    const addonText =
      addons.length > 0
        ? `\n\n*⭐ Add-ons for Today:*\n${formattedAddons.join("\n")}`
        : "";

    const message = `🚗 *Daily Service Alert*\n\nDate: ${dateStr}\n\nCustomer: ${item.user?.name}\nPhone: ${item.user?.phone}\nAddress: ${item.vehicle?.address?.locality || "As per record"}\nVehicle: ${item.vehicle?.type} (${item.vehicle?.number})${addonText}\n\nPlease proceed with the service.`;

    const url = `whatsapp://send?phone=${workerPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed");
      }
    });
  };

  const renderCard = ({ item }: { item: any }) => {
    const isAssigned = !!(item.worker || item.workerName);
    const startDate = new Date(item.startDate);
    const completed = item.servicesCompleted || 0;
    const nextServiceDate = new Date(startDate);
    nextServiceDate.setDate(startDate.getDate() + completed);

    return (
      <View className="bg-card rounded-[32px] p-5 mb-4 border border-border shadow-sm">
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-row items-center flex-1">
            <View className="w-11 h-11 rounded-full bg-background items-center justify-center mr-3 border border-border/50">
              <Text className="text-[16px] font-[800] color-text">
                {item.user?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-[16px] font-[700] color-text"
                numberOfLines={1}
              >
                {item.user?.name || "Unknown User"}
              </Text>
              <Text className="text-[12px] color-textSecondary font-[500] mt-0.5">
                +91 {item.user?.phone}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full border ${
              item.status === "active"
                ? "bg-green-500/10 border-green-500/20"
                : item.status === "ongoing"
                  ? "bg-blue-500/10 border-blue-500/20"
                  : "bg-background border-border"
            }`}
          >
            <Text
              className={`text-[10px] font-[800] uppercase tracking-wider ${
                item.status === "active"
                  ? "text-green-500"
                  : item.status === "ongoing"
                    ? "text-blue-500"
                    : "text-textSecondary"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="bg-background/50 p-4 rounded-2xl border border-border/50 mb-5">
          <Text className="text-[15px] font-[800] color-text mb-1">
            {item.plan?.name || "Subscription Plan"}
          </Text>
          <Text className="text-[13px] color-textSecondary font-[600]">
            {item.vehicle?.type || "Car"} • {item.vehicle?.number || "No Plate"}
          </Text>
          <Text className="text-[12px] color-textSecondary/70 mt-1 font-[500]">
            {item.vehicle?.address?.locality || "Doorstep Service"}
          </Text>
        </View>

        {item.status === "ongoing" && (
          <View className="flex-row items-center bg-blue-500/5 p-3.5 rounded-2xl border border-blue-500/10 mb-5">
            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
            <Text className="text-[13px] color-blue-500 font-[700] ml-2.5">
              Next Service:{" "}
              {nextServiceDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        )}

        <View className="mb-6">
          <View className="flex-row justify-between mb-2 items-center">
            <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
              Service Progress
            </Text>
            <Text className="text-[13px] font-[800] color-primary">
              {item.servicesCompleted}/{item.servicesTotal}
            </Text>
          </View>
          <View className="h-2 bg-background rounded-full overflow-hidden border border-border/30">
            <View
              className="h-full bg-primary"
              style={{
                width: `${(item.servicesCompleted / item.servicesTotal) * 100}%`,
              }}
            />
          </View>
          <Text className="text-[11px] color-textSecondary/60 mt-2 font-[600] text-right">
            Expires in {getDaysRemaining(item.endDate)} days
          </Text>
        </View>

        <View className="pt-4 border-t border-border/50">
          {isAssigned ? (
            <View className="gap-3">
              <View className="flex-row items-center px-1">
                <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
                  <Ionicons name="person" size={14} color="#3B82F6" />
                </View>
                <Text className="text-[14px] color-text font-[700]">
                  {item.worker?.name || item.workerName || "Worker"}
                </Text>
              </View>

              <View className="flex-row gap-2">
                {item.status === "ongoing" && (
                  <>
                    <TouchableOpacity
                      className="flex-1 bg-green-500 flex-row items-center justify-center py-3.5 rounded-2xl shadow-sm shadow-green-500/20"
                      onPress={() => handleNotifyWorker(item)}
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={18}
                        color="#fff"
                        className="mr-2"
                      />
                      <Text className="text-white font-[800] text-[13px]">
                        Notify
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-primary flex-row items-center justify-center py-3.5 rounded-2xl shadow-sm shadow-primary/20"
                      onPress={() => handleMarkDone(item._id)}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#000"
                        className="mr-2"
                      />
                      <Text className="text-black font-[800] text-[13px]">
                        Mark Done
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-primary flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-primary/30"
              onPress={() => {
                setSelectedSub(item);
                setWorkerModalVisible(true);
              }}
            >
              <Ionicons
                name="person-add"
                size={18}
                color="#000"
                className="mr-2.5"
              />
              <Text className="text-black font-[800] text-[15px]">
                Assign Professional
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-6 bg-card border-b border-border/50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[18px] font-[800] color-text">Admin Panel</Text>
          <View className="w-10" />
        </View>

        {/* Filters */}
        <View className="flex-row px-5 py-6 gap-3">
          {["Requests", "Ongoing", "All"].map((f) => (
            <TouchableOpacity
              key={f}
              className={`px-6 py-3 rounded-[20px] border ${
                filter === f
                  ? "bg-primary border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border"
              }`}
              onPress={() => setFilter(f)}
            >
              <Text
                className={`text-[13px] font-[800] ${
                  filter === f ? "text-black" : "text-textSecondary"
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={subscriptions}
            renderItem={renderCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View className="items-center py-20 bg-card rounded-[32px] mx-5 border border-border border-dashed">
                <Ionicons
                  name="documents-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text className="text-[15px] font-[600] color-textSecondary mt-4">
                  No subscriptions found
                </Text>
              </View>
            }
          />
        )}

        {/* Worker Modal */}
        <Modal
          visible={workerModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setWorkerModalVisible(false)}
        >
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="absolute inset-0 bg-black/70"
              activeOpacity={1}
              onPress={() => setWorkerModalVisible(false)}
            />
            <View className="bg-card rounded-t-[40px] p-6 pb-12 border-t border-border shadow-2xl">
              <View className="w-12 h-1.5 bg-border/50 rounded-full self-center mb-6" />
              <Text className="text-[22px] font-[800] color-text mb-6 pl-2">
                Select Worker
              </Text>

              <FlatList
                data={workers}
                keyExtractor={(item) => item._id}
                renderItem={({ item: worker }) => (
                  <TouchableOpacity
                    className="flex-row items-center py-4 px-2 border-b border-border/50"
                    onPress={() => handleAssignWorker(worker)}
                  >
                    <View className="w-11 h-11 rounded-full bg-background items-center justify-center mr-4 border border-border/50 overflow-hidden">
                      {worker.profileImage ? (
                        <Image
                          source={{ uri: worker.profileImage }}
                          className="w-11 h-11"
                        />
                      ) : (
                        <Text className="text-[18px] font-[800] color-text">
                          {worker.name.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-[16px] font-[700] color-text">
                        {worker.name}
                      </Text>
                      <Text className="text-[12px] color-textSecondary mt-0.5 font-[500]">
                        {worker.phone}
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-full ${worker.status === "Active" ? "bg-green-500/10" : "bg-background"}`}
                    >
                      <Text
                        className={`text-[10px] font-[800] ${worker.status === "Active" ? "color-green-500" : "color-textSecondary"}`}
                      >
                        {worker.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              />

              <TouchableOpacity
                className="mt-8 py-4.5 bg-background border border-border rounded-2xl items-center"
                onPress={() => setWorkerModalVisible(false)}
              >
                <Text className="text-[16px] font-[800] color-text">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}
