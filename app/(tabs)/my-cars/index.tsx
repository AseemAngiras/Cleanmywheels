import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
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

const cars: Car[] = [
  {
    id: "1",
    name: "Toyota Camry",
    type: "Sedan",
    number: "KA-01-MJ-1234",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  },
  {
    id: "2",
    name: "Honda CR-V",
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
  const renderCar = ({ item }: { item: Car }) => {
    return (
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
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color="#000" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={16} color="#777" />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cars</Text>

        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.addText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* Cars List */}
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

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
    alignItems: "center",
    marginVertical: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD84D",
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  carName: {
    fontSize: 16,
    fontWeight: "700",
  },

  carType: {
    color: "#888",
    marginTop: 2,
  },

  plate: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#F2F2F2",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  plateText: {
    fontSize: 11,
    fontWeight: "700",
    marginRight: 6,
  },

  plateNumber: {
    fontSize: 11,
  },

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
    backgroundColor: "#FFF6CC",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  editText: {
    marginLeft: 6,
    fontWeight: "600",
  },

  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  removeText: {
    marginLeft: 6,
    color: "#777",
  },

  footerText: {
    textAlign: "center",
    color: "#AAA",
    marginVertical: 10,
    fontSize: 13,
  },
});
