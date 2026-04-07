import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import {
  useGetAddonsQuery,
  useCreateAddonMutation,
  useUpdateAddonMutation,
  useDeleteAddonMutation,
} from "@/store/api/subscriptionApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Addon } from "@/types/subscription";

const PRICE_KEYS = [
  { key: "ONE_TIME", label: "One-Time" },
  { key: "DAILY", label: "Daily (30)" },
  { key: "WEEKLY", label: "Weekly (4)" },
  { key: "BIWEEKLY", label: "Bi-Weekly (8)" },
  { key: "ALTERNATE_DAY", label: "Alt Day (15)" },
];

export default function ServiceManagementScreen() {
  const insets = useSafeAreaInsets();

  const { data: addons, isLoading } = useGetAddonsQuery();
  const [createAddon, { isLoading: isCreating }] = useCreateAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] = useUpdateAddonMutation();
  const [deleteAddon] = useDeleteAddonMutation();

  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [editData, setEditData] = useState<any>({
    name: "",
    description: "",
    price: "0",
    durationMinutes: "30",
    priceMatrix: {
      ONE_TIME: "0",
      DAILY: "0",
      WEEKLY: "0",
      BIWEEKLY: "0",
      ALTERNATE_DAY: "0",
    },
  });

  const handleEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setEditData({
      name: addon.name,
      description: addon.description,
      price: (addon.price || 0).toString(),
      durationMinutes: (addon.durationMinutes || 30).toString(),
      priceMatrix: {
        ONE_TIME: (addon.priceMatrix?.ONE_TIME || addon.price || 0).toString(),
        DAILY: (addon.priceMatrix?.DAILY || 0).toString(),
        WEEKLY: (addon.priceMatrix?.WEEKLY || 0).toString(),
        BIWEEKLY: (addon.priceMatrix?.BIWEEKLY || 0).toString(),
        ALTERNATE_DAY: (addon.priceMatrix?.ALTERNATE_DAY || 0).toString(),
      },
    });
  };

  const handleAddNew = () => {
    setEditingAddon({ _id: "new" } as any);
    setEditData({
      name: "",
      description: "",
      price: "0",
      durationMinutes: "30",
      priceMatrix: {
        ONE_TIME: "0",
        DAILY: "0",
        WEEKLY: "0",
        BIWEEKLY: "0",
        ALTERNATE_DAY: "0",
      },
    });
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service? This may affect active subscriptions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddon(id).unwrap();
              Alert.alert("Success", "Service deleted successfully");
            } catch (err: any) {
              Alert.alert("Error", err?.data?.message || "Failed to delete");
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    const payload = {
      name: editData.name,
      description: editData.description,
      price: Number(editData.priceMatrix.ONE_TIME) || Number(editData.price),
      durationMinutes: Number(editData.durationMinutes),
      isActive: true,
      priceMatrix: {
        ONE_TIME: Number(editData.priceMatrix.ONE_TIME),
        DAILY: Number(editData.priceMatrix.DAILY),
        WEEKLY: Number(editData.priceMatrix.WEEKLY),
        BIWEEKLY: Number(editData.priceMatrix.BIWEEKLY),
        ALTERNATE_DAY: Number(editData.priceMatrix.ALTERNATE_DAY),
      },
    };

    try {
      if (editingAddon?._id === "new") {
        await createAddon(payload).unwrap();
        Alert.alert("Success", "Service created successfully");
      } else if (editingAddon?._id) {
        await updateAddon({ id: editingAddon._id, body: payload }).unwrap();
        Alert.alert("Success", "Service updated successfully");
      }
      setEditingAddon(null);
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to save");
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row items-center px-5 py-4 bg-background border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-[20px] font-[800] color-text tracking-tight">
            Service Catalog
          </Text>
          <Text className="text-[12px] color-textSecondary font-[600] uppercase tracking-widest">
            Manage Add-ons
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddNew}
          className="bg-primary px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 flex-row items-center"
        >
          <Ionicons name="add" size={18} color="#000" />
          <Text className="text-black font-[800] text-[12px] ml-1">
            Add Service
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        className="flex-1 px-5 pt-6"
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} size="large" />
        ) : !addons || addons.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="sparkles-outline" size={60} color={Colors.textSecondary} />
            <Text className="color-textSecondary mt-4 font-[600]">No services found</Text>
          </View>
        ) : (
          addons.map((addon: Addon) => (
            <TouchableOpacity
              key={addon._id}
              activeOpacity={0.7}
              onPress={() => handleEdit(addon)}
              className="mb-4 bg-card rounded-[24px] p-5 border border-border/50 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-[18px] font-[800] color-text">{addon.name}</Text>
                  <Text className="text-[13px] color-textSecondary mt-1" numberOfLines={2}>
                    {addon.description || "No description"}
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Text className="color-primary font-[800] text-[12px]">₹{addon.price}</Text>
                </View>
              </View>
              
              <View className="flex-row flex-wrap gap-2 mt-2">
                {PRICE_KEYS.map(({ key, label }) => {
                  const price = addon.priceMatrix?.[key as keyof typeof addon.priceMatrix];
                  if (!price) return null;
                  return (
                    <View key={key} className="bg-background px-3 py-1.5 rounded-xl border border-border/30">
                      <Text className="text-[10px] color-textSecondary font-[700] uppercase">{label}</Text>
                      <Text className="text-[13px] font-[800] color-text">₹{price}</Text>
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={editingAddon !== null} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/60 justify-end"
        >
          <View className="bg-card w-full rounded-t-[32px] p-6 border-t border-border shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[20px] font-[900] color-text">
                {editingAddon?._id === "new" ? "New Service" : "Edit Service"}
              </Text>
              <View className="flex-row gap-2">
                {editingAddon?._id !== "new" && (
                  <TouchableOpacity
                    onPress={() => editingAddon && handleDelete(editingAddon._id)}
                    className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setEditingAddon(null)}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                >
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="max-h-[60vh]">
              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">Service Name</Text>
                <TextInput
                  className="bg-background border border-border rounded-2xl px-4 h-14 text-[16px] font-[700] color-text"
                  value={editData.name}
                  onChangeText={(val) => setEditData((p: any) => ({ ...p, name: val }))}
                  placeholder="e.g. Interior Cleaning"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">Description</Text>
                <TextInput
                  className="bg-background border border-border rounded-2xl px-4 py-3 min-h-[80px] text-[14px] font-[500] color-text"
                  multiline
                  value={editData.description}
                  onChangeText={(val) => setEditData((p: any) => ({ ...p, description: val }))}
                  placeholder="What is included in this service?"
                />
              </View>

              <Text className="text-[14px] font-[800] color-text mt-4 mb-3">Multi-Frequency Pricing</Text>
              <View className="flex-row flex-wrap justify-between">
                {PRICE_KEYS.map(({ key, label }) => (
                  <View key={key} className="w-[48%] mb-4">
                    <Text className="text-[10px] font-[800] color-textSecondary uppercase mb-1.5 px-1">{label}</Text>
                    <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                      <Text className="text-[16px] font-[800] color-textSecondary mr-1">₹</Text>
                      <TextInput
                        className="flex-1 text-[16px] font-[800] color-text"
                        keyboardType="numeric"
                        value={editData.priceMatrix[key]}
                        onChangeText={(val) => setEditData((p: any) => ({
                          ...p,
                          priceMatrix: { ...p.priceMatrix, [key]: val }
                        }))}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSave}
              className="mt-6 bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30"
              disabled={isUpdating || isCreating}
            >
              {isUpdating || isCreating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black text-[16px] font-[900]">Save Service</Text>
              )}
            </TouchableOpacity>
            <View style={{ height: insets.bottom }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}
