import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useGetAllSubscriptionsQuery } from "@/store/api/subscriptionApi";
import { UserSubscription } from "@/types/subscription";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { formatPrice } from "@/utils/formatPrice";

export default function AdminSubscriptionScreen() {
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );

  const { data, isLoading, isFetching, refetch } = useGetAllSubscriptionsQuery({
    page: 1,
    perPage: 50,
    status: filterStatus,
  });

  const subscriptions = data?.subscriptions || [];
  const [selectedSub, setSelectedSub] = useState<UserSubscription | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const openDetails = (sub: UserSubscription) => {
    setSelectedSub(sub);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedSub(null);
  };

  const renderStatusBadge = (status: string) => {
    let color = "#64748B";
    let bg = "bg-slate-500/10";
    let border = "border-slate-500/20";

    switch (status) {
      case "active":
        color = "#10B981";
        bg = "bg-green-500/10";
        border = "border-green-500/20";
        break;
      case "pending":
        color = "#F59E0B";
        bg = "bg-yellow-500/10";
        border = "border-yellow-500/20";
        break;
      case "expired":
        color = "#EF4444";
        bg = "bg-red-500/10";
        border = "border-red-500/20";
        break;
      case "cancelled":
        color = "#6B7280";
        bg = "bg-gray-500/10";
        border = "border-gray-500/20";
        break;
    }

    return (
      <View className={`${bg} ${border} border px-3 py-1 rounded-full`}>
        <Text
          style={{ color }}
          className="text-[10px] font-[900] uppercase tracking-wider"
        >
          {status}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UserSubscription }) => (
    <TouchableOpacity
      className="bg-card rounded-[32px] p-6 mb-4 border border-border/50 shadow-sm"
      onPress={() => openDetails(item)}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4 border border-primary/20">
            <Text className="text-[20px] font-[900] color-primary">
              {(item as any).user?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[17px] font-[800] color-text"
              numberOfLines={1}
            >
              {(item as any).user?.name || "Unknown User"}
            </Text>
            <Text className="text-[13px] color-textSecondary font-[600] mt-0.5">
              {(item as any).user?.phone || "No phone"}
            </Text>
          </View>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      <View className="h-[1px] bg-border/20 mb-5" />

      <View className="gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
            Vehicle
          </Text>
          <Text
            className="text-[14px] font-[800] color-text flex-1 text-right ml-4"
            numberOfLines={1}
          >
            {item.vehicle
              ? `${item.vehicle.brand} ${item.vehicle.model}`
              : "N/A"}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
            Plan
          </Text>
          <Text className="text-[14px] font-[800] color-primary uppercase">
            {item.plan?.name || "N/A"}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
            Valid Until
          </Text>
          <Text className="text-[14px] font-[800] color-text">
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-5 bg-background">
        <View>
          <Text className="text-[24px] font-[900] color-text tracking-tighter">
            Subscriptions
          </Text>
          <Text className="text-[12px] color-textSecondary font-[800] uppercase tracking-widest mt-0.5">
            Admin Dashboard
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          className="w-10 h-10 bg-card rounded-xl border border-border/50 items-center justify-center"
        >
          <Ionicons name="refresh" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 15 }}
        className="flex-none"
      >
        {["All", "Active", "Pending", "Expired"].map((label) => {
          const status = label === "All" ? undefined : label.toLowerCase();
          const isActive = filterStatus === status;
          return (
            <TouchableOpacity
              key={label}
              className={`mr-3 px-6 py-2.5 rounded-2xl border ${isActive ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-card border-border/50"}`}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                className={`text-[13px] font-[800] ${isActive ? "color-black" : "color-text"}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshing={isFetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center mt-20">
              <View className="w-24 h-24 bg-card rounded-[40px] items-center justify-center mb-6 border border-border/30">
                <Ionicons
                  name="documents-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text className="text-[18px] font-[800] color-text">
                No subscriptions found
              </Text>
              <Text className="text-[14px] color-textSecondary text-center mt-1">
                Try adjusting your filters.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              color={Colors.primary}
            />
          ) : null
        }
      />

      {/* Details Modal */}
      <Modal visible={detailsVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity
            className="absolute inset-0"
            onPress={closeDetails}
          />
          <View className="bg-card rounded-t-[44px] p-8 pb-12 border-t border-border shadow-2xl max-h-[90%]">
            <View className="w-14 h-1.5 bg-border/50 rounded-full self-center mb-10" />

            <View className="flex-row justify-between items-center mb-10">
              <Text className="text-[26px] font-[900] color-text">Details</Text>
              <TouchableOpacity
                onPress={closeDetails}
                className="w-10 h-10 bg-background rounded-full items-center justify-center border border-border"
              >
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedSub && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="gap-8"
              >
                <View>
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                    Reference ID
                  </Text>
                  <View className="bg-background p-4 rounded-2xl border border-dashed border-border/50">
                    <Text className="text-[14px] font-[700] color-primary font-mono">
                      {selectedSub._id}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                    Customer Info
                  </Text>
                  <View className="bg-background p-5 rounded-[28px] border border-border/50 gap-4">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text className="text-[15px] font-[800] color-text ml-3">
                        {(selectedSub as any).user?.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text className="text-[15px] font-[800] color-text ml-3">
                        {(selectedSub as any).user?.phone}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text className="text-[15px] font-[800] color-text ml-3">
                        {(selectedSub as any).user?.email || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                    Vehicle
                  </Text>
                  <View className="bg-background p-5 rounded-[28px] border border-border/50">
                    <Text className="text-[16px] font-[900] color-text">
                      {selectedSub.vehicle?.brand} {selectedSub.vehicle?.model}
                    </Text>
                    <Text className="text-[14px] font-[800] color-primary mt-1">
                      {selectedSub.vehicle?.vehicleNo}
                    </Text>
                    <Text className="text-[13px] color-textSecondary font-[600] mt-1">
                      Color: {selectedSub.vehicle?.color || "N/A"}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                    Subscription Plan
                  </Text>
                  <View className="bg-background p-5 rounded-[28px] border border-border/50 gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-[14px] font-[800] color-text">
                        {selectedSub.plan?.name}
                      </Text>
                      <Text className="text-[14px] font-[900] color-primary">
                        ₹{formatPrice(selectedSub.plan?.price)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-[13px] font-[600] color-textSecondary italic">
                        Duration
                      </Text>
                      <Text className="text-[13px] font-[800] color-text">
                        {new Date(selectedSub.startDate).toLocaleDateString()} -{" "}
                        {new Date(selectedSub.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-[13px] font-[600] color-textSecondary">
                        Progress
                      </Text>
                      <Text className="text-[13px] font-[900] color-text">
                        {selectedSub.servicesCompleted} /{" "}
                        {selectedSub.servicesTotal} Services
                      </Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                    Assigned Professional
                  </Text>
                  <View className="bg-background p-5 rounded-[28px] border border-border/50 flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
                      <Ionicons
                        name="ribbon-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <Text className="text-[15px] font-[800] color-text">
                      {selectedSub.worker
                        ? selectedSub.worker.name
                        : "Not Assigned"}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
