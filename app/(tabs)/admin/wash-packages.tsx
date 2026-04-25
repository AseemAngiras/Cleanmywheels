import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useGetWashPackagesQuery,
  useUpdateWashPackageMutation,
  useCreateWashPackageMutation,
  useDeleteWashPackageMutation,
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
  const { showAlert } = useAlert();

  const { data: response, isLoading } = useGetWashPackagesQuery({
    page: 1,
    perPage: 100,
    packageType: "ONE_TIME",
  });
  const [updateWashPackage, { isLoading: isUpdating }] =
    useUpdateWashPackageMutation();
  const [createWashPackage, { isLoading: isCreating }] =
    useCreateWashPackageMutation();
  const [deleteWashPackage] = useDeleteWashPackageMutation();

  const packages = (response?.data?.washPackageList || []).filter(
    (pkg) => pkg.status !== "Archived",
  );

  const [editingPackage, setEditingPackage] = useState<WashPackage | null>(
    null,
  );
  const [editData, setEditData] = useState({
    name: "",
    features: "",
    hatchback: "",
    sedan: "",
    suv: "",
    twoWheeler: "",
  });

  const handleEdit = (pkg: WashPackage) => {
    setEditingPackage(pkg);
    setEditData({
      name: pkg.name,
      features: pkg.features?.join(", ") || "",
      hatchback: (typeof pkg.prices?.hatchback === 'object' ? pkg.prices.hatchback.ONE_TIME : (pkg.prices?.hatchback || pkg.price || 0)).toString(),
      sedan: (typeof pkg.prices?.sedan === 'object' ? pkg.prices.sedan.ONE_TIME : (pkg.prices?.sedan || pkg.price || 0)).toString(),
      suv: (typeof pkg.prices?.suv === 'object' ? pkg.prices.suv.ONE_TIME : (pkg.prices?.suv || pkg.price || 0)).toString(),
      twoWheeler: (typeof pkg.prices?.twoWheeler === 'object' ? pkg.prices.twoWheeler.ONE_TIME : (pkg.prices?.twoWheeler || pkg.price || 0)).toString(),
    });
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;

    showAlert({
      title: "Confirm Update",
      message: "Are you sure you want to update this wash package?",
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await updateWashPackage({
                id: editingPackage._id,
                body: {
                  name: editData.name,
                  packageType: "ONE_TIME",
                  features: editData.features
                    .split(",")
                    .map((f) => f.trim())
                    .filter((f) => f),
                  prices: {
                    hatchback: Number(editData.hatchback),
                    sedan: Number(editData.sedan),
                    suv: Number(editData.suv),
                    twoWheeler: Number(editData.twoWheeler),
                  },
                },
              }).unwrap();
              showAlert({
                title: "Success",
                message: "Package updated successfully",
                type: "success",
              });
              setEditingPackage(null);
            } catch (err: any) {
              showAlert({
                title: "Error",
                message: err?.data?.message || "Failed to update package",
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
      features: "",
      hatchback: "0",
      sedan: "0",
      suv: "0",
      twoWheeler: "0",
    });
  };

  const handleDelete = async (id: string) => {
    showAlert({
      title: "Delete Package",
      message: "Are you sure you want to delete this wash package? This action cannot be undone.",
      type: "error",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWashPackage(id).unwrap();
              showAlert({
                title: "Success",
                message: "Package deleted successfully",
                type: "success",
              });
            } catch (err: any) {
              showAlert({
                title: "Error",
                message: err?.data?.message || "Failed to delete package",
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
        await createWashPackage({
          name: editData.name,
          packageType: "ONE_TIME",
          features: editData.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f),
          prices: {
            hatchback: Number(editData.hatchback),
            sedan: Number(editData.sedan),
            suv: Number(editData.suv),
            twoWheeler: Number(editData.twoWheeler),
          },
          price: Number(editData.hatchback),
          status: "Active",
          // logo: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
          tag: "Standard",
        }).unwrap();
        showAlert({
          title: "Success",
          message: "Package created successfully",
          type: "success",
        });
        setEditingPackage(null);
      } catch (err: any) {
        showAlert({
          title: "Error",
          message: err?.data?.message || "Failed to create package",
          type: "error",
        });
      }
    } else {
      handleUpdate();
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
            One-time Washes
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
        className="flex-1 px-5 pt-6"
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} size="large" />
        ) : packages.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons
              name="car-outline"
              size={60}
              color={Colors.textSecondary}
            />
            <Text className="color-textSecondary mt-4 font-[600]">
              No one-time washes found
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
                    Edit Package
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-[10px] color-textSecondary font-[700] uppercase mb-2">
                  Features
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {pkg.features?.map((f, i) => (
                    <View
                      key={i}
                      className="bg-background px-3 py-1 rounded-full border border-border/30"
                    >
                      <Text className="text-[10px] color-textSecondary font-[600]">
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {Object.entries(VEHICLE_TYPE_TO_PRICE_KEY).map(
                  ([type, key]) => {
                    const priceData = (pkg.prices as any)?.[key];
                    const price = typeof priceData === 'object' ? (priceData.ONE_TIME || 0) : (priceData || pkg.price);
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
                  },
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editingPackage !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full rounded-[32px] p-6 border border-border shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[18px] font-[800] color-text">
                {editingPackage?._id === "new"
                  ? "Add New Package"
                  : "Edit Package"}
              </Text>
              {editingPackage?._id !== "new" && (
                <TouchableOpacity
                  onPress={() => {
                    const id = editingPackage?._id;
                    setEditingPackage(null);
                    if (id) handleDelete(id);
                  }}
                  className="bg-red-500/10 w-10 h-10 rounded-full border border-red-500/20 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView className="max-h-[500px] mb-6">
              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Package Name
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                  <TextInput
                    className="flex-1 text-[16px] font-[800] color-text"
                    value={editData.name}
                    onChangeText={(val) =>
                      setEditData((prev) => ({ ...prev, name: val.replace(/[<>'"%;()&+]/g, "") }))
                    }
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                  Features (comma separated)
                </Text>
                <View className="bg-background border border-border rounded-2xl px-4 py-3 min-h-[100px]">
                  <TextInput
                    className="text-[14px] font-[600] color-text"
                    multiline
                    value={editData.features}
                    onChangeText={(val) =>
                      setEditData((prev) => ({ ...prev, features: val.replace(/[<>'"%;()&+]/g, "") }))
                    }
                    placeholder="E.g. Interior Cleaning, Tire Polish, Waxcoat"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <Text className="text-[14px] font-[800] color-text mt-4 mb-4">
                Pricing by Vehicle Type
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {Object.keys(VEHICLE_TYPE_TO_PRICE_KEY).map((type) => {
                  const key = VEHICLE_TYPE_TO_PRICE_KEY[
                    type
                  ] as keyof typeof editData;
                  return (
                    <View key={type} className="w-[48%] mb-4">
                      <Text className="text-[10px] font-[800] color-textSecondary uppercase mb-2 px-1">
                        {type}
                      </Text>
                      <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                        <Text className="text-[16px] font-[800] color-textSecondary mr-1">
                          ₹
                        </Text>
                        <TextInput
                          className="flex-1 text-[16px] font-[800] color-text"
                          keyboardType="numeric"
                          value={editData[key]}
                          onChangeText={(val) =>
                            setEditData((prev) => ({ ...prev, [key]: val.replace(/[^0-9]/g, "") }))
                          }
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
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
                onPress={handleSave}
                disabled={isUpdating || isCreating}
              >
                {isUpdating || isCreating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="color-black font-[900]">
                    {editingPackage?._id === "new" ? "Create" : "Update"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
