import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
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

export default function AdminSubscriptionPlansScreen() {
  const insets = useSafeAreaInsets();
  
  const { data: response, isLoading } = useGetWashPackagesQuery({
    page: 1,
    perPage: 100,
    packageType: "SUBSCRIPTION"
  });
  const [updateWashPackage, { isLoading: isUpdating }] =
    useUpdateWashPackageMutation();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<WashPackage | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    price: 0,
    features: [""] as string[],
    prices: {
      hatchback: 0,
      sedan: 0,
      suv: 0,
      twoWheeler: 0,
    },
    packageType: "SUBSCRIPTION",
  });

  const handleEdit = (pkg: WashPackage) => {
    setEditingPackage(pkg);
    setEditData({
      name: pkg.name,
      price: pkg.price,
      features: pkg.features.length > 0 ? [...pkg.features] : [""],
      prices: {
        hatchback: pkg.prices?.hatchback || 0,
        sedan: pkg.prices?.sedan || 0,
        suv: pkg.prices?.suv || 0,
        twoWheeler: pkg.prices?.twoWheeler || 0,
      },
      packageType: pkg.packageType || "SUBSCRIPTION",
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;

    try {
      await updateWashPackage({
        id: editingPackage._id,
        body: {
          name: editData.name,
          price: editData.price,
          features: editData.features.filter((f) => f.trim() !== ""),
          prices: editData.prices,
          packageType: editData.packageType as any,
        },
      }).unwrap();

      Alert.alert("Success", "Subscription plan updated successfully");
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to update plan");
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

  const updateVehiclePrice = (type: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [VEHICLE_TYPE_TO_PRICE_KEY[type]]: numValue,
      },
    }));
  };

  const packages = response?.data?.washPackageList || [];

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-row items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.back()}
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
            {packages.map((pkg: WashPackage) => (
              <TouchableOpacity
                key={pkg._id}
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
                      ₹{pkg.price}
                    </Text>
                  </View>
                </View>

                {pkg.features && pkg.features.length > 0 && (
                  <View className="gap-2 mb-4">
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <View key={i} className="flex-row items-center">
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
                    {Object.entries(pkg.prices || {}).map(([type, price]) => (
                      <View
                        key={type}
                        className="bg-background px-2 py-1 rounded-lg border border-border/50"
                      >
                        <Text className="text-[9px] color-textSecondary uppercase font-[800]">
                          {type.charAt(0)}: ₹{price}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                </View>
              </TouchableOpacity>
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
              <Text className="text-[22px] font-[800] color-text">
                Edit {editData.packageType === "ONE_TIME" ? "Wash" : "Plan"}
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
              >
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 pb-12" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Service Type
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setEditData(prev => ({ ...prev, packageType: "ONE_TIME" }))}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      editData.packageType === "ONE_TIME"
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text className={`font-[700] text-[12px] ${editData.packageType === "ONE_TIME" ? "color-black" : "color-textSecondary"}`}>
                      ONE-TIME
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditData(prev => ({ ...prev, packageType: "SUBSCRIPTION" }))}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      editData.packageType === "SUBSCRIPTION"
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text className={`font-[700] text-[12px] ${editData.packageType === "SUBSCRIPTION" ? "color-black" : "color-textSecondary"}`}>
                      SUBSCRIPTION
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Plan Name
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text font-[600]"
                    value={editData.name}
                    onChangeText={(text) => setEditData((prev) => ({ ...prev, name: text }))}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Base Price (₹)
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text font-[600]"
                    value={editData.price.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, price: parseInt(text) || 0 }))
                    }
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-3 px-1">
                  Pricing by Vehicle Type
                </Text>
                <View className="gap-3">
                  {Object.keys(VEHICLE_TYPE_TO_PRICE_KEY).map((type) => (
                    <View key={type} className="flex-row items-center justify-between bg-background p-3 rounded-2xl border border-border/50">
                      <Text className="text-text font-[600]">{type}</Text>
                      <View className="flex-row items-center bg-card border border-border px-3 rounded-xl h-10 w-24">
                        <Text className="text-textSecondary mr-1">₹</Text>
                        <TextInput
                          className="flex-1 text-text font-[700] text-[13px]"
                          value={editData.prices[VEHICLE_TYPE_TO_PRICE_KEY[type] as keyof typeof editData.prices].toString()}
                          keyboardType="numeric"
                          onChangeText={(text) => updateVehiclePrice(type, text)}
                        />
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
                  <View key={index} className="flex-row items-center mb-3">
                    <View className="flex-1 bg-background border border-border rounded-2xl px-4 h-12 flex-row items-center">
                      <TextInput
                        className="flex-1 text-text font-[500] text-[13px]"
                        value={feature}
                        onChangeText={(text) => updateFeature(text, index)}
                        placeholder="Feature description..."
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFeature(index)}
                      className="ml-2 w-10 h-10 items-center justify-center bg-red-500/10 rounded-full"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleUpdate}
                disabled={isUpdating}
                className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 mb-10"
              >
                {isUpdating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-[800] text-[16px]">
                    Update Plan
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
