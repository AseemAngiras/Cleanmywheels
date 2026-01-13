import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { useAppDispatch } from "../../../store/hooks";
// import { addCar, Car, removeCar, updateCar } from "../../../store/slices/userSlice"; // Old Redux actions
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehiclesQuery,
  useUpdateVehicleMutation
} from "../../../store/api/vehicleApi";

// Interface for Frontend Car (matching existing structure but mapped from/to backend)
export interface Car {
  id: string; // Mapped from _id
  name: string; // Not in backend explicitly, derived from Type or stored? 
  // Backend doesn't have 'name', it has 'vehicleType'. 
  // We'll use vehicleType as name or just map it.
  // Wait, user inputs 'Car Name'. Backend only has 'vehicleType' and 'vehicleNo'.
  // If 'name' is important, we should add it to backend. 
  // But for now, let's assume Name is optional and local. Or we Map Name -> ???
  // Actually, let's use VehicleType as the main descriptor.
  type: string;
  number: string;
  image: string;
}

export default function MyCarsScreen() {
  const dispatch = useAppDispatch();

  // API Hooks
  const { data: vehiclesData, isLoading, refetch } = useGetVehiclesQuery();
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    if (vehiclesData && vehiclesData.data) {
      // Map backend data to frontend structure
      // Backend: { _id, vehicleNo, vehicleType, image }
      // Frontend: { id, name, type, number, image }
      const mappedCars = vehiclesData.data.map((v: any) => ({
        id: v._id,
        name: v.vehicleType, // Fallback name to Type as backend lacks Name
        type: v.vehicleType,
        number: v.vehicleNo,
        image: v.image,
      }));
      setCars(mappedCars);
    }
  }, [vehiclesData]);


  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const [name, setName] = useState(""); // Currently unused in backend, maybe just use Type
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true, // If we want to send base64 to backend? Backend schema is String.
      // Ideally we upload and get URL, but for base64 string, it works if small.
      // Or URI if uploading?
      // Let's assume URI for now, but backend creates nothing from URI.
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

  const handleSaveCar = async () => {
    if (!type || !number) {
      Alert.alert("Error", "Vehicle type and number are required");
      return;
    }

    // Validate Indian vehicle registration number format
    const vehicleNumberPattern = /^[A-Z]{2,3}\d{2}[A-Z]{1,2}\d{4}$/i;
    const cleanedNumber = number.trim().replace(/\s+/g, '').toUpperCase();

    if (!vehicleNumberPattern.test(cleanedNumber)) {
      Alert.alert(
        "Invalid Vehicle Number",
        "Please enter a valid vehicle number (e.g., CH01GH4321, PB10QH3210)"
      );
      return;
    }

    // Backend payload
    const payload = {
      vehicleNo: cleanedNumber,
      vehicleType: type, // Should be one of Enum values ideally
      image: image || "",
    };

    try {
      if (editingCarId) {
        await updateVehicle({ id: editingCarId, body: payload }).unwrap();
        Alert.alert("Success", "Vehicle updated successfully");
      } else {
        await createVehicle(payload).unwrap();
        Alert.alert("Success", "Vehicle added successfully");
      }
      setModalVisible(false);
      refetch(); // Refresh list
    } catch (error: any) {
      console.error("Vehicle Save Error:", error);
      const msg = error?.data?.message || "Failed to save vehicle";
      Alert.alert("Error", msg);
    }
  };

  const handleRemoveCar = (id: string) => {
    Alert.alert("Remove Car", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVehicle(id).unwrap();
            refetch();
          } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Failed to remove vehicle");
          }
        },
      },
    ]);
  };

  /* ---------- Render ---------- */
  const renderCar = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.carName}>{item.name}</Text>
          {/* Using Name (mapped from Type) because backend has no Name field */}
          <Text style={styles.carType}>{item.type}</Text>

          <View style={styles.plate}>
            <Text style={styles.plateText}>IND</Text>
            <Text style={styles.plateNumber}>{item.number}</Text>
          </View>
        </View>

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.carImage} />
        ) : (
          <View style={[styles.carImage, styles.imagePlaceholder]}>
            <Ionicons name="car-sport" size={30} color="#CCC" />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color="#000" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveCar(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#777" />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 22 }}>
          My cars :
          <Text style={{ fontWeight: "bold" }}> {cars.length} </Text>
        </Text>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.addText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#C8F000" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={renderCar}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No cars found. Add one!</Text>}
        />
      )}

      {/* ADD / EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingCarId ? "Edit Car" : "Add Car"}
            </Text>

            {/* Note: 'Name' is not persisted in backend currently. Removed or kept as UI only? 
                User input 'name' will be ignored or we map it to type? 
                Let's keep it but warn it might not persist if not in schema.
                Actually, let's remove Name input to avoid confusion, or assume standard types.
            */}

            <Text style={{ marginBottom: 5, fontWeight: '600' }}>Type (e.g. Car, SUV, Sedan)</Text>
            <TextInput
              placeholder="Car Type"
              value={type}
              onChangeText={setType}
              style={styles.input}
            />

            <Text style={{ marginBottom: 5, fontWeight: '600' }}>Number</Text>
            <TextInput
              placeholder="Car Number"
              value={number}
              onChangeText={setNumber}
              style={styles.input}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <Text>Select Car Image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCar} disabled={isCreating || isUpdating}>
                <Text>{isCreating || isUpdating ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9", paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", marginVertical: 16 },
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#C8F000", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addText: { marginLeft: 6, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 14, elevation: 3 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  carName: { fontSize: 16, fontWeight: "700" },
  carType: { color: "#888" },
  plate: { flexDirection: "row", backgroundColor: "#F2F2F2", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  plateText: { fontSize: 11, fontWeight: "700", marginRight: 6 },
  plateNumber: { fontSize: 11 },
  carImage: { width: 90, height: 60, borderRadius: 12, marginLeft: 10, justifyContent: "center", alignItems: "center" },
  imagePlaceholder: { backgroundColor: "#EEE" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  editBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#C8F000", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  editText: { marginLeft: 6, fontWeight: "600" },
  removeBtn: { flexDirection: "row", paddingHorizontal: 18, paddingVertical: 10 },
  removeText: { marginLeft: 6, color: "#777" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", width: "90%", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 10, marginBottom: 10 },
  imagePicker: { height: 120, borderWidth: 1, borderColor: "#DDD", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  preview: { width: "100%", height: "100%", borderRadius: 12 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  cancelBtn: { padding: 12 },
  saveBtn: { backgroundColor: "#C8F000", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
});
