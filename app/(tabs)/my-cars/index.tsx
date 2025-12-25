import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addCar, Car, removeCar, updateCar } from "../../../store/slices/userSlice";

const CAR_TYPES = ["SUV", "Sedan", "Hatchback", "Other Vehicle"];

export default function MyCarsScreen() {
  const dispatch = useAppDispatch();
  const cars = useAppSelector((state) => state.user.cars);

  const [modalVisible, setModalVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openAddModal = () => {
    setEditingCarId(null);
    setName("");
    setType("");
    setNumber("");
    setImage(undefined);
    setModalVisible(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCarId(car.id);
    setName(car.name);
    setType(car.type);
    setNumber(car.number);
    setImage(car.image);
    setModalVisible(true);
  };

  const handleSaveCar = () => {
    if (!type.trim()) {
      Alert.alert("Error", "Please select a vehicle type");
      return;
    }
    if (!number.trim()) {
      Alert.alert("Error", "License plate is required");
      return;
    }

    const carPayload: Car = {
      id: editingCarId ?? Date.now().toString(),
      name: name.trim() || `${type} Car`,
      type: type.trim(),
      number: number.trim().toUpperCase(),
      image: image || "",
    };

    if (editingCarId) dispatch(updateCar(carPayload));
    else dispatch(addCar(carPayload));

    setModalVisible(false);
  };

  const handleRemoveCar = (id: string) => {
    Alert.alert("Remove Vehicle", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeCar(id)) },
    ]);
  };

  const renderCar = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.imageWrapper}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.carImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="car-outline" size={32} color="#bbb" />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.carName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.carType}>{item.type}</Text>

          <View style={styles.plate}>
            <Text style={styles.plateInd}>IND</Text>
            <View style={styles.plateDivider} />
            <Text style={styles.plateNumber}>{item.number}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveCar(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          My Vehicles <Text style={styles.count}>: {cars.length}</Text>
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* List or Empty State */}
      {cars.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No vehicles added yet</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={renderCar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingCarId ? "Edit Vehicle" : "Add Vehicle"}
            </Text>

            <TextInput
              placeholder="Car Name (optional)"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Car Type Picker */}
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setTypePickerVisible(true)}
            >
              <Text style={type ? styles.pickerText : styles.pickerPlaceholder}>
                {type || "Select Car Type"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            <TextInput
              placeholder="License Plate"
              value={number}
              onChangeText={setNumber}
              style={styles.input}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={28} color="#999" />
                  <Text style={styles.imageText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCar}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Car Type Picker Modal */}
      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Vehicle Type</Text>
            {CAR_TYPES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.pickerItem,
                  item === type && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setType(item);
                  setTypePickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    item === type && styles.pickerItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {item === type && (
                  <Ionicons name="checkmark" size={20} color="#C8F000" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#333",
  },
  count: {
    fontWeight: "700",
    color: "#000",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8F000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addText: {
    marginLeft: 6,
    fontWeight: "600",
    color: "#000",
  },

  // Compact Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  carImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  carName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },
  carType: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  plate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbe6",
    borderWidth: 1.5,
    borderColor: "#ffd700",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  plateInd: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0066cc",
    letterSpacing: 0.5,
  },
  plateDivider: {
    width: 1.5,
    height: 18,
    backgroundColor: "#ffd700",
    marginHorizontal: 8,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editBtn: {
    backgroundColor: "#C8F000",
    padding: 10,
    borderRadius: 20,
  },
  removeBtn: {
    padding: 10,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#aaa",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fcfcfc",
  },
  pickerInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fcfcfc",
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  imagePicker: {
    height: 140,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imageText: {
    marginTop: 8,
    color: "#999",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    marginRight: 8,
  },
  cancelText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#C8F000",
    padding: 14,
    borderRadius: 25,
    marginLeft: 8,
  },
  saveText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#000",
  },

  // Type Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 10,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerItemSelected: {
    backgroundColor: "#f0ffdf",
    borderRadius: 12,
    marginVertical: 4,
  },
  pickerItemText: {
    fontSize: 17,
    color: "#333",
  },
  pickerItemTextSelected: {
    fontWeight: "600",
    color: "#000",
  },
});