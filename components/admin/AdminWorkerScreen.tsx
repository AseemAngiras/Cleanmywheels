import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
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

export default function AdminWorkerScreen() {
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
    Alert.alert(
      "Delete Worker",
      `Are you sure you want to delete ${worker.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorker(worker._id).unwrap();
              Alert.alert("Success", "Worker deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete worker");
            }
          },
        },
      ],
    );
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingWorker) {
        await updateWorker({ id: editingWorker._id, data: values }).unwrap();
        Alert.alert("Success", "Worker updated successfully");
      } else {
        await createWorker({
          ...values,
          countryCode: "+91",
          joiningDate: new Date().toISOString(),
        }).unwrap();
        Alert.alert("Success", "Worker created successfully");
      }
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to save worker details",
      );
    }
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        setSelectedWorkerId(selectedWorkerId === item._id ? null : item._id)
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.jobRole}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Active"
                  ? "#DCFCE7"
                  : item.status === "On Leave"
                    ? "#FEF9C3"
                    : item.status === "Busy"
                      ? "#FEE2E2"
                      : "#F1F5F9",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "Active"
                    ? "#166534"
                    : item.status === "On Leave"
                      ? "#854D0E"
                      : item.status === "Busy"
                        ? "#991B1B"
                        : "#475569",
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>+91 {item.phone}</Text>
        </View>
        {item.address ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        ) : null}
      </View>

      {selectedWorkerId === item._id && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditWorker(item)}
          >
            <Ionicons name="create-outline" size={18} color="#0F172A" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteWorker(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Workers</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddWorker}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Worker</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={data?.workers}
          renderItem={renderWorkerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workers found</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingWorker ? "Edit Worker" : "Add New Worker"}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
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
          submitLabel={editingWorker ? "Update Worker" : "Create Worker"}
        />
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    // paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // gap: 1,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  role: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#475569",
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  editButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 12,
    backgroundColor: "#FEF2F2",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
});
