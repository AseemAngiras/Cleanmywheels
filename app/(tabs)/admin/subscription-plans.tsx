import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useAlert } from "@/components/providers/AlertProvider";
import { BackHandler } from "react-native";
import {
  useGetSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
  useCreateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  SubscriptionPlan,
} from "@/store/api/subscriptionPlanApi";
import { useGetAddonsQuery } from "@/store/api/subscriptionApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VEHICLE_TYPE_TO_PRICE_KEY: Record<string, string> = {
  Hatchback: "hatchback",
  Sedan: "sedan",
  SUV: "suv",
  "Two Wheeler": "twoWheeler",
};

export default function AdminSubscriptionPlansScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)/dashboard");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const { data: response, isLoading } = useGetSubscriptionPlansQuery({
    page: 1,
    perPage: 100,
  });
  const [updateSubscriptionPlan, { isLoading: isUpdating }] =
    useUpdateSubscriptionPlanMutation();
  const [createSubscriptionPlan, { isLoading: isCreating }] =
    useCreateSubscriptionPlanMutation();
  const [deleteSubscriptionPlan] = useDeleteSubscriptionPlanMutation();

  const { data: addons } = useGetAddonsQuery();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPlan | null>(
    null,
  );
  const [editData, setEditData] = useState({
    name: "",
    tag: "",
    features: [] as string[],
    includedServiceIds: [] as string[],
    prices: {
      hatchback: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
      sedan: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
      suv: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
      twoWheeler: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
    },
  });

  const handleEdit = (pkg: SubscriptionPlan) => {
    setEditingPackage(pkg);
    setEditData({
      name: pkg.name,
      tag: pkg.tag || "",
      features: pkg.features || [],
      includedServiceIds: pkg.includedServiceIds || [],
      prices: {
        hatchback: {
          DAILY: pkg.prices?.hatchback?.DAILY || 0,
          WEEKLY: pkg.prices?.hatchback?.WEEKLY || 0,
          BIWEEKLY: pkg.prices?.hatchback?.BIWEEKLY || 0,
          ALTERNATE_DAY: pkg.prices?.hatchback?.ALTERNATE_DAY || 0,
          ONE_TIME: pkg.prices?.hatchback?.ONE_TIME || 0,
        },
        sedan: {
          DAILY: pkg.prices?.sedan?.DAILY || 0,
          WEEKLY: pkg.prices?.sedan?.WEEKLY || 0,
          BIWEEKLY: pkg.prices?.sedan?.BIWEEKLY || 0,
          ALTERNATE_DAY: pkg.prices?.sedan?.ALTERNATE_DAY || 0,
          ONE_TIME: pkg.prices?.sedan?.ONE_TIME || 0,
        },
        suv: {
          DAILY: pkg.prices?.suv?.DAILY || 0,
          WEEKLY: pkg.prices?.suv?.WEEKLY || 0,
          BIWEEKLY: pkg.prices?.suv?.BIWEEKLY || 0,
          ALTERNATE_DAY: pkg.prices?.suv?.ALTERNATE_DAY || 0,
          ONE_TIME: pkg.prices?.suv?.ONE_TIME || 0,
        },
        twoWheeler: {
          DAILY: pkg.prices?.twoWheeler?.DAILY || 0,
          WEEKLY: pkg.prices?.twoWheeler?.WEEKLY || 0,
          BIWEEKLY: pkg.prices?.twoWheeler?.BIWEEKLY || 0,
          ALTERNATE_DAY: pkg.prices?.twoWheeler?.ALTERNATE_DAY || 0,
          ONE_TIME: pkg.prices?.twoWheeler?.ONE_TIME || 0,
        },
      },
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;

    if (!editData.name.trim()) {
      showAlert({
        title: "Error",
        message: "Plan name is required",
        type: "error",
      });
      return;
    }
    if (!editData.tag.trim()) {
      showAlert({
        title: "Error",
        message: "Plan tag is required",
        type: "error",
      });
      return;
    }
    if (editData.features.filter((f) => f.trim() !== "").length === 0) {
      showAlert({
        title: "Error",
        message: "At least one feature is required",
        type: "error",
      });
      return;
    }

    showAlert({
      title: "Confirm Update",
      message: "Are you sure you want to update this subscription plan?",
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await updateSubscriptionPlan({
                id: editingPackage._id,
                body: {
                  name: editData.name,
                  tag: editData.tag,
                  features: editData.features.filter((f) => f.trim() !== ""),
                  includedServiceIds: editData.includedServiceIds,
                  prices: editData.prices,
                },
              }).unwrap();

              showAlert({
                title: "Success",
                message: "Subscription plan updated successfully",
                type: "success",
              });
              setEditModalVisible(false);
            } catch (error: any) {
              showAlert({
                title: "Error",
                message: error?.data?.message || "Failed to update plan",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleAddNew = () => {
    setEditingPackage({ _id: "new" } as any);
    setEditData({
      name: "",
      tag: "",
      features: [],
      includedServiceIds: [],
      prices: {
        hatchback: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
        sedan: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
        suv: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
        twoWheeler: { DAILY: 0, WEEKLY: 0, BIWEEKLY: 0, ALTERNATE_DAY: 0, ONE_TIME: 0 },
      },
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    showAlert({
      title: "Delete Plan",
      message: "Are you sure you want to delete this subscription plan? This action cannot be undone.",
      type: "error",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubscriptionPlan(id).unwrap();
              showAlert({
                title: "Success",
                message: "Plan deleted successfully",
                type: "success",
              });
            } catch (err: any) {
              showAlert({
                title: "Error",
                message: err?.data?.message || "Failed to delete plan",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleSave = async () => {
    if (editingPackage?._id === "new") {
      try {
        if (!editData.name.trim()) {
          showAlert({
            title: "Error",
            message: "Plan name is required",
            type: "error",
          });
          return;
        }
        if (!editData.tag.trim()) {
          showAlert({
            title: "Error",
            message: "Plan tag is required",
            type: "error",
          });
          return;
        }
        if (editData.features.filter((f) => f.trim() !== "").length === 0) {
          showAlert({
            title: "Error",
            message: "At least one feature is required",
            type: "error",
          });
          return;
        }

        const payload = {
          name: editData.name,
          tag: editData.tag,
          features: editData.features.filter((f) => f.trim() !== ""),
          includedServiceIds: editData.includedServiceIds,
          prices: editData.prices,
          price: editData.prices.hatchback.DAILY || 0,
          status: "Active" as const,
        };

        await createSubscriptionPlan(payload).unwrap();
        showAlert({
          title: "Success",
          message: "Subscription plan created successfully",
          type: "success",
        });
        setEditModalVisible(false);
      } catch (error: any) {
        showAlert({
          title: "Error",
          message: error?.data?.message || "Failed to create plan",
          type: "error",
        });
      }
    } else {
      handleUpdate();
    }
  };

  const addFeature = () => {
    setEditData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const updateFeature = (text: string, index: number) => {
    const newFeatures = [...editData.features];
    newFeatures[index] = text;
    setEditData((prev) => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateVehiclePrice = (type: string, freq: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const vehicleKey = VEHICLE_TYPE_TO_PRICE_KEY[type];
    setEditData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [vehicleKey]: {
          ...(prev.prices as any)[vehicleKey],
          [freq]: numValue,
        },
      },
    }));
  };

  const packages = (response?.data?.subscriptionPlanList || []).filter(
    (pkg: any) => pkg.status !== "Archived",
  );

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-row items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/dashboard")}
          className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-[20px] font-[800] color-text tracking-tight">
            Subscription Plans
          </Text>
          <Text className="text-[12px] color-textSecondary font-[600] uppercase tracking-widest">
            Admin Dashboard
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddNew}
          className="bg-primary px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 flex-row items-center"
        >
          <Ionicons name="add" size={18} color="#000" />
          <Text className="text-black font-[800] text-[12px] ml-1">
            Add New
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : packages.length === 0 ? (
          <View className="items-center py-20 bg-card rounded-[32px] mt-10 mx-5 border border-border border-dashed">
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text className="text-[15px] font-[600] color-textSecondary mt-4">
              No subscription plans found
            </Text>
          </View>
        ) : (
          <View className="px-5 pt-6">
            {packages.map((pkg: SubscriptionPlan) => (
              <View key={pkg._id}>
                <TouchableOpacity
                  onPress={() => handleEdit(pkg)}
                  className="bg-card rounded-[32px] p-5 mb-5 border border-border shadow-sm"
                >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-[18px] font-[800] color-text mb-1">
                      {pkg.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={Colors.primary}
                      />
                      <Text className="text-[12px] font-[700] color-primary uppercase tracking-widest ml-1.5">
                        Subscription Plan
                      </Text>
                    </View>
                  </View>
                  <View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                    <Text className="text-primary font-[800] text-[13px]">
                      ₹{pkg.prices?.hatchback?.DAILY || pkg.price || 0}
                    </Text>
                  </View>
                </View>

                {pkg.features && pkg.features.length > 0 && (
                  <View className="gap-2 mb-4">
                    {pkg.features.slice(0, 3).map((f: string, i: number) => (
                      <View key={`feature-${i}`} className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#22C55E"
                        />
                        <Text className="text-[13px] color-textSecondary font-[500] ml-2">
                          {f}
                        </Text>
                      </View>
                    ))}
                    {pkg.features.length > 3 && (
                      <Text className="text-[11px] color-textSecondary italic ml-1">
                        + {pkg.features.length - 3} more features
                      </Text>
                    )}
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-4 border-t border-border/50">
                  <View className="flex-row gap-2">
                    {Object.entries(pkg.prices || {}).map(([type, price]: [string, any]) => (
                      <View
                        key={`price-${type}`}
                        className="bg-background px-2 py-1 rounded-lg border border-border/50"
                      >
                        <Text className="text-[9px] color-textSecondary uppercase font-[800]">
                          {type.charAt(0)}: ₹{price.DAILY || 0}
                        </Text>
                      </View>
                    ))}
                  </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-card rounded-t-[40px] border-t border-border max-h-[90%]">
            <View className="w-12 h-1.5 bg-border/50 rounded-full self-center my-4" />

            <View className="flex-row justify-between items-center px-6 mb-6">
              <View className="flex-1">
                <Text className="text-[22px] font-[800] color-text">
                  {editingPackage?._id === "new" ? "Add New Plan" : "Edit Plan"}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                {editingPackage?._id !== "new" && (
                  <TouchableOpacity
                    onPress={() => {
                      const id = editingPackage?._id;
                      setEditModalVisible(false);
                      if (id) handleDelete(id);
                    }}
                    className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                >
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="px-6 pb-12"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Plan Name
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text font-[600]"
                    value={editData.name}
                    placeholder="Enter plan name"
                    placeholderTextColor={Colors.textSecondary}
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, name: text.replace(/[<>'"%;()&+]/g, "") }))
                    }
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Tag (e.g. Most Popular)
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text font-[600]"
                    value={editData.tag}
                    placeholder="Enter tag"
                    placeholderTextColor={Colors.textSecondary}
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, tag: text.replace(/[<>'"%;()&+]/g, "") }))
                    }
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-[14px] font-[800] color-text mb-4">
                  Pricing by Vehicle & Frequency
                </Text>
                <View className="gap-6">
                  {Object.keys(VEHICLE_TYPE_TO_PRICE_KEY).map((type) => (
                    <View key={type} className="bg-background/50 p-4 rounded-3xl border border-border/30">
                      <Text className="text-primary font-[800] text-[12px] uppercase mb-3 tracking-widest">{type}</Text>
                      <View className="flex-row flex-wrap justify-between gap-3">
                        {[
                          { label: "Daily", key: "DAILY" },
                          { label: "Weekly", key: "WEEKLY" },
                          { label: "Bi-Weekly", key: "BIWEEKLY" },
                          { label: "Alt Day", key: "ALTERNATE_DAY" },
                        ].map((freq) => (
                          <View key={freq.key} className="w-[47%]">
                            <Text className="text-[10px] font-[800] color-textSecondary uppercase mb-1.5 px-1">
                              {freq.label}
                            </Text>
                            <View className="flex-row items-center bg-card border border-border px-3 rounded-xl h-12">
                              <Text className="text-textSecondary mr-1 font-[700]">₹</Text>
                              <TextInput
                                className="flex-1 text-text font-[800] text-[14px]"
                                value={(editData.prices[VEHICLE_TYPE_TO_PRICE_KEY[type] as keyof typeof editData.prices] as any)[freq.key].toString()}
                                keyboardType="numeric"
                                onChangeText={(text) => updateVehiclePrice(type, freq.key, text.replace(/[^0-9]/g, ""))}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-3 px-1">
                  <Text className="text-[12px] font-[800] color-textSecondary uppercase">
                    Features
                  </Text>
                  <TouchableOpacity onPress={addFeature}>
                    <Text className="text-primary font-[700] text-[12px]">
                      + Add Feature
                    </Text>
                  </TouchableOpacity>
                </View>
                {editData.features.map((feature, index) => (
                  <View key={`feature-${index}`} className="flex-row items-center mb-3">
                    <View className="flex-1 bg-background border border-border rounded-2xl px-4 h-12 flex-row items-center">
                      <TextInput
                        className="flex-1 text-text font-[500] text-[13px]"
                        value={feature}
                        onChangeText={(text) => updateFeature(text.replace(/[<>'"%;()&+]/g, ""), index)}
                        placeholder="Feature description..."
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFeature(index)}
                      className="ml-2 w-10 h-10 items-center justify-center bg-red-500/10 rounded-full"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Included Services (ID Linked) */}
              <View className="mb-8">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-3 px-1">
                  Included Services (Direct Link)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {addons?.map((addon: any) => {
                    const isIncluded = editData.includedServiceIds?.includes(addon._id);
                    return (
                      <View key={addon._id}>
                        <TouchableOpacity
                          onPress={() => {
                            const newIds = isIncluded
                              ? editData.includedServiceIds.filter(id => id !== addon._id)
                              : [...(editData.includedServiceIds || []), addon._id];
                            setEditData(prev => ({ ...prev, includedServiceIds: newIds }));
                          }}
                          className={`px-4 py-2 rounded-full border ${
                            isIncluded ? "bg-primary border-primary" : "bg-card border-border"
                          }`}
                        >
                          <Text className={`text-[12px] font-[700] ${isIncluded ? "text-black" : "text-text"}`}>
                            {addon.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
                <Text className="text-[11px] color-textSecondary mt-2 px-1 italic">
                  * Linked services are hidden from the user&apos;s optional add-ons.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isUpdating || isCreating}
                className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 mb-10"
              >
                {isUpdating || isCreating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-[800] text-[16px]">
                    {editingPackage?._id === "new"
                      ? "Create Plan"
                      : "Update Plan"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
