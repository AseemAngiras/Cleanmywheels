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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import {
  useGetWashPackagesQuery,
  useUpdateWashPackageMutation,
  WashPackage,
} from "@/store/api/washPackageApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VEHICLE_TYPE_TO_PRICE_KEY: Record<string, string> = {
  Hatchback: "hatchback",
  Sedan: "sedan",
  SUV: "suv",
  "Two Wheeler": "twoWheeler",
};

export default function AdminWashPackagesScreen() {
  const insets = useSafeAreaInsets();
  const { data: response, isLoading } = useGetWashPackagesQuery({
    page: 1,
    perPage: 100,
  });
  const [updateWashPackage, { isLoading: isUpdating }] =
    useUpdateWashPackageMutation();

  const packages = response?.data?.washPackageList || [];

  const [editingPackage, setEditingPackage] = useState<WashPackage | null>(null);
  const [newPrices, setNewPrices] = useState({
    hatchback: "",
    sedan: "",
    suv: "",
    twoWheeler: "",
  });

  const handleEdit = (pkg: WashPackage) => {
    setEditingPackage(pkg);
    setNewPrices({
      hatchback: (pkg.prices?.hatchback || pkg.price || 0).toString(),
      sedan: (pkg.prices?.sedan || pkg.price || 0).toString(),
      suv: (pkg.prices?.suv || pkg.price || 0).toString(),
      twoWheeler: (pkg.prices?.twoWheeler || pkg.price || 0).toString(),
    });
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;
    try {
      await updateWashPackage({
        id: editingPackage._id,
        body: {
          prices: {
            hatchback: Number(newPrices.hatchback),
            sedan: Number(newPrices.sedan),
            suv: Number(newPrices.suv),
            twoWheeler: Number(newPrices.twoWheeler),
          },
        },
      }).unwrap();
      Alert.alert("Success", "Prices updated successfully");
      setEditingPackage(null);
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to update prices");
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-background border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-[20px] font-[800] color-text tracking-tight">
            Manage Packages
          </Text>
          <Text className="text-[12px] color-textSecondary font-[600] uppercase tracking-widest">
            Admin Dashboard
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        className="flex-1 px-5 pt-6"
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} size="large" />
        ) : packages.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="car-outline" size={60} color={Colors.textSecondary} />
            <Text className="color-textSecondary mt-4 font-[600]">
              No wash packages found
            </Text>
          </View>
        ) : (
          packages.map((pkg) => (
            <View
              key={pkg._id}
              className="mb-4 bg-card rounded-[24px] p-5 border border-border/50"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-[18px] font-[800] color-text">
                    {pkg.name}
                  </Text>
                  <Text className="text-[13px] color-textSecondary mt-1">
                    {pkg.tag || "Wash Package"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleEdit(pkg)}
                  className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20"
                >
                  <Text className="color-primary font-[800] text-[12px] uppercase">
                    Edit Prices
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {Object.entries(VEHICLE_TYPE_TO_PRICE_KEY).map(([type, key]) => {
                  const price = (pkg.prices as any)?.[key] || pkg.price;
                  return (
                    <View
                      key={type}
                      className="bg-background px-3 py-2 rounded-xl border border-border/50 flex-1 min-w-[45%]"
                    >
                      <Text className="text-[10px] color-textSecondary font-[700] uppercase">
                        {type}
                      </Text>
                      <Text className="text-[16px] font-[800] color-text mt-0.5">
                        ₹{price}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editingPackage !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full rounded-[32px] p-6 border border-border shadow-2xl">
            <Text className="text-[18px] font-[800] color-text mb-2">
              Edit Prices
            </Text>
            <Text className="text-[14px] color-textSecondary mb-6">
              {editingPackage?.name}
            </Text>

            <ScrollView className="max-h-[400px] mb-6">
              {Object.keys(VEHICLE_TYPE_TO_PRICE_KEY).map((type) => {
                const key = VEHICLE_TYPE_TO_PRICE_KEY[type] as keyof typeof newPrices;
                return (
                  <View key={type} className="mb-4">
                    <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                      {type} Price
                    </Text>
                    <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                      <Text className="text-[18px] font-[800] color-textSecondary mr-2">
                        ₹
                      </Text>
                      <TextInput
                        className="flex-1 text-[18px] font-[800] color-text"
                        keyboardType="numeric"
                        value={newPrices[key]}
                        onChangeText={(val) =>
                          setNewPrices((prev) => ({ ...prev, [key]: val }))
                        }
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center border border-border"
                onPress={() => setEditingPackage(null)}
              >
                <Text className="color-textSecondary font-[700]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 bg-primary rounded-xl items-center justify-center"
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="color-black font-[900]">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
