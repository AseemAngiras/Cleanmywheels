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

type Car = {
  id: string;
  name: string;
  type: string;
  number: string;
  image: string; 
};

const initialCars: Car[] = [
  {
    id: "1",
    name: "Toyota Camry",
    type: "Sedan",
    number: "KA-01-MJ-1234",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  },
  {
    id: "2",
    name: "Tesla X",
    type: "SUV",
    number: "DL-3C-5678",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  },
  {
    id: "3",
    name: "Hyundai i20",
    type: "Hatchback",
    number: "MH-12-AB-9012",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  },
];

export default function MyCarsScreen() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
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
    setImage(null);
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
    if (!name || !type || !number || !image) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (editingCarId) {
      setCars((prev) =>
        prev.map((car) =>
          car.id === editingCarId
            ? { ...car, name, type, number, image }
            : car
        )
      );
    } else {
      setCars((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name,
          type,
          number,
          image,
        },
      ]);
    }

    setModalVisible(false);
  };

  const handleRemoveCar = (id: string) => {
    Alert.alert("Remove Car", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setCars((prev) => prev.filter((car) => car.id !== id)),
      },
    ]);
  };

  const renderCar = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.carName}>{item.name}</Text>
          <Text style={styles.carType}>{item.type}</Text>

          <View style={styles.plate}>
            <Text style={styles.plateText}>IND</Text>
            <Text style={styles.plateNumber}>{item.number}</Text>
          </View>
        </View>

        <Image source={{ uri: item.image }} style={styles.carImage} />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={{fontSize: 22}}>
            My cars : <Text style={{fontWeight: "bold"}}> {cars.length} </Text>
        </Text>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.addText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        showsVerticalScrollIndicator={false}
      />

      {/* ADD / EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingCarId ? "Edit Car" : "Add Car"}
            </Text>

            <TextInput
              placeholder="Car Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Car Type"
              value={type}
              onChangeText={setType}
              style={styles.input}
            />

            <TextInput
              placeholder="Car Number"
              value={number}
              onChangeText={setNumber}
              style={styles.input}
            />

            {/* IMAGE PICKER */}
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
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

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCar}
              >
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#84c95c",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  carName: { fontSize: 16, fontWeight: "700" },
  carType: { color: "#888" },
  plate: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  plateText: { fontSize: 11, fontWeight: "700", marginRight: 6 },
  plateNumber: { fontSize: 11 },
  carImage: {
    width: 90,
    height: 60,
    borderRadius: 12,
    marginLeft: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#84c95c",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editText: { marginLeft: 6, fontWeight: "600" },
  removeBtn: { flexDirection: "row", paddingHorizontal: 18, paddingVertical: 10 },
  removeText: { marginLeft: 6, color: "#777" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    height: 120,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: { padding: 12 },
  saveBtn: {
    backgroundColor: "#84c95c",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
