import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { InteractivePressable } from "../ui/InteractivePressable";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetWorkersQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
  Worker,
} from "@/store/api/workerApi";
import { WorkerForm } from "./WorkerForm";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useAlert } from "@/components/providers/AlertProvider";

export default function AdminWorkerScreen() {
  const { showAlert } = useAlert();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const { data, isLoading } = useGetWorkersQuery({
    page: 1,
    limit: 10,
  });
  const [createWorker, { isLoading: isCreating }] = useCreateWorkerMutation();
  const [updateWorker, { isLoading: isUpdating }] = useUpdateWorkerMutation();
  const [deleteWorker] = useDeleteWorkerMutation();

  const handleAddWorker = () => {
    setEditingWorker(null);
    setModalVisible(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setModalVisible(true);
  };

  const handleDeleteWorker = (worker: Worker) => {
    showAlert({
      title: "Delete Professional",
      message: `Are you sure you want to remove ${worker.name}?`,
      type: "error",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorker(worker._id).unwrap();
              showAlert({
                title: "Success",
                message: "Worker deleted successfully",
                type: "success",
              });
            } catch (error) {
              showAlert({
                title: "Error",
                message: "Failed to delete worker",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingWorker) {
        await updateWorker({ id: editingWorker._id, data: values }).unwrap();
        showAlert({
          title: "Success",
          message: "Worker updated successfully",
          type: "success",
        });
      } else {
        await createWorker({
          ...values,
          countryCode: "+91",
          joiningDate: new Date().toISOString(),
        }).unwrap();
        showAlert({
          title: "Success",
          message: "Worker created successfully",
          type: "success",
        });
      }
      setModalVisible(false);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error?.data?.message || "Failed to save worker details",
        type: "error",
      });
    }
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => {
    const isSelected = selectedWorkerId === item._id;

    return (
      <InteractivePressable
        className={`bg-card rounded-[32px] p-5 mb-4 border ${isSelected ? "border-primary" : "border-border"} shadow-sm`}
        onPress={() => setSelectedWorkerId(isSelected ? null : item._id)}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-background items-center justify-center mr-4 border border-border/50">
            <Text className="text-[20px] font-[800] color-text">
              {item.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[17px] font-[800] color-text">
              {item.name}
            </Text>
            <Text className="text-[13px] color-textSecondary font-[600] mt-0.5">
              {item.jobRole}
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full border ${
              item.status === "Active"
                ? "bg-green-500/10 border-green-500/20"
                : item.status === "On Leave"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : item.status === "Busy"
                    ? "bg-orange-500/10 border-orange-500/20"
                    : "bg-background border-border"
            }`}
          >
            <Text
              className={`text-[10px] font-[800] uppercase tracking-wider ${
                item.status === "Active"
                  ? "text-green-500"
                  : item.status === "On Leave"
                    ? "text-yellow-500"
                    : item.status === "Busy"
                      ? "text-orange-500"
                      : "text-textSecondary"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="gap-3 mb-2">
          <View className="flex-row items-center px-1">
            <Ionicons
              name="call-outline"
              size={15}
              color={Colors.textSecondary}
            />
            <Text className="text-[14px] color-textSecondary font-[500] ml-3">
              +91 {item.phone}
            </Text>
          </View>
          {item.address ? (
            <View className="flex-row items-center px-1">
              <Ionicons
                name="location-outline"
                size={15}
                color={Colors.textSecondary}
              />
              <Text
                className="text-[14px] color-textSecondary font-[500] ml-3"
                numberOfLines={1}
              >
                {item.address}
              </Text>
            </View>
          ) : null}
        </View>

        {isSelected && (
          <View className="flex-row gap-3 mt-5 pt-5 border-t border-border/50">
            <InteractivePressable
              className="flex-1 bg-background border border-border flex-row items-center justify-center py-3.5 rounded-2xl"
              onPress={() => handleEditWorker(item)}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={Colors.text}
                className="mr-2"
              />
              <Text className="color-text font-[800] text-[13px]">
                Edit Details
              </Text>
            </InteractivePressable>
            <InteractivePressable
              className="bg-red-500/10 border border-red-500/20 px-4 items-center justify-center rounded-2xl"
              onPress={() => handleDeleteWorker(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </InteractivePressable>
          </View>
        )}
      </InteractivePressable>
    );
  };

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
          <Text className="text-[20px] font-[800] color-text">
            Professionals
          </Text>
          <InteractivePressable
            className="bg-primary flex-row items-center px-4 py-2.5 rounded-full shadow-lg shadow-primary/30"
            onPress={handleAddWorker}
          >
            <Ionicons
              name="add"
              size={20}
              color="#000"
              style={{ marginRight: 4 }}
            />
            <Text className="color-black font-[800] text-[13px]">Add New</Text>
          </InteractivePressable>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={data?.workers}
            renderItem={renderWorkerItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-20 bg-card rounded-[32px] mx-5 border border-border border-dashed">
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text className="text-[15px] font-[600] color-textSecondary mt-4">
                  No professionals found
                </Text>
              </View>
            }
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-end"
          >
            <InteractivePressable
              className="absolute inset-0 bg-black/70"
              onPress={() => setModalVisible(false)}
            />
            <View className="bg-card rounded-t-[40px] shadow-2xl border-t border-border h-[85%] overflow-hidden">
              <View className="w-12 h-1.5 bg-border/50 rounded-full self-center my-4" />
              <View className="flex-row justify-between items-center px-6 mb-6">
                <Text className="text-[22px] font-[800] color-text">
                  {editingWorker ? "Edit Professional" : "Add New Professional"}
                </Text>
                <InteractivePressable
                  onPress={() => setModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                >
                  <Ionicons name="close" size={20} color={Colors.text} />
                </InteractivePressable>
              </View>

              <WorkerForm
                initialValues={
                  editingWorker
                    ? {
                        name: editingWorker.name,
                        phone: editingWorker.phone,
                        jobRole: editingWorker.jobRole,
                        address: editingWorker.address,
                        status: editingWorker.status,
                      }
                    : undefined
                }
                onSubmit={handleSubmit}
                onCancel={() => setModalVisible(false)}
                isLoading={isCreating || isUpdating}
                submitLabel={
                  editingWorker ? "Update Professional" : "Create Professional"
                }
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}
