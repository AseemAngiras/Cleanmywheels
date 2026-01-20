import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCar } from "@/store/slices/userSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function VehicleDetailsScreen() {
  const dispatch = useAppDispatch();
  const cars = useAppSelector((state) => state.user.cars);

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(cars.length === 0);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    });

    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });

    return unsubscribe;
  }, [navigation]);

  //   useEffect(() => {
  //   console.log('CURRENT SCREEN:', 'vehicle-details or my-cars');
  //   console.log('Store instance in this component:', store);
  //   console.log('Cars from selector:', cars);
  // }, []);

  const vehicleTypes = [
    { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
    { id: "Sedan", name: "Sedan", icon: "car" },
    { id: "SUV", name: "SUV", icon: "car-estate" },
    { id: "Other", name: "Others", icon: "truck-delivery" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* ---------- Header ---------- */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Vehicle Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.container, { paddingBottom: 130 }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* ---------- Saved Cars ---------- */}
              {cars.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Select Saved Vehicle</Text>

                  {cars.map((car) => {
                    const isSelected = selectedCarId === car.id;

                    return (
                      <TouchableOpacity
                        key={car.id}
                        style={[
                          styles.savedCarCard,
                          isSelected && styles.selectedSavedCar,
                        ]}
                        onPress={() => {
                          setSelectedCarId(car.id);
                          setAddingNew(false);
                        }}
                      >
                        <View>
                          <Text style={styles.savedCarName}>{car.name}</Text>
                          <Text style={styles.savedCarNumber}>
                            {car.number}
                          </Text>
                        </View>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#84c95c"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.addNewToggle}
                    onPress={() => {
                      setAddingNew(true);
                      setSelectedCarId(null);
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#000"
                    />
                    <Text style={{ marginLeft: 6 }}>Add new vehicle</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ---------- Add New Vehicle ---------- */}
              {addingNew && (
                <>
                  <Text style={styles.sectionTitle}>Select Vehicle Type</Text>

                  <View style={styles.gridContainer}>
                    {vehicleTypes.map((type) => {
                      const isSelected = vehicleType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.typeCard,
                            isSelected && styles.selectedTypeCard,
                          ]}
                          onPress={() => setVehicleType(type.id)}
                        >
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#84c95c"
                              />
                            </View>
                          )}
                          <View
                            style={[
                              styles.iconContainer,
                              isSelected
                                ? styles.selectedIconContainer
                                : styles.unselectedIconContainer,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={type.icon as any}
                              size={32}
                              color={isSelected ? "#1a1a1a" : "#999"}
                            />
                          </View>
                          <Text
                            style={[
                              styles.typeText,
                              isSelected && styles.selectedTypeText,
                            ]}
                          >
                            {type.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionTitle}>Vehicle Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.G. IND-1234"
                    placeholderTextColor="#ccc"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    autoCapitalize="characters"
                  />
                </>
              )}
            </ScrollView>

            {/* ---------- Footer ---------- */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  console.log(
                    "NEXT BUTTON PRESSED — this should always appear first"
                  );
                  let finalCar;

                  // Existing car selected
                  if (selectedCarId) {
                    finalCar = cars.find((c) => c.id === selectedCarId);
                    console.log("selected existing car:", finalCar);
                  }

                  // Adding new car
                  if (addingNew) {
                    if (!vehicleNumber.trim()) {
                      alert("Please enter vehicle number");
                      return;
                    }

                    finalCar = {
                      id: Date.now().toString(),
                      type: vehicleType,
                      number: vehicleNumber.toUpperCase(),
                      name: vehicleType.toUpperCase(),
                      image: "",
                    };

                    console.log("creating new car -> will dispatch:", finalCar);
                    dispatch(addCar(finalCar));
                    console.log(
                      "Dispatch called! (but state might not update yet)"
                    );
                  }

                  if (!finalCar) console.log("No final car -> exiting");
                  return;
                }}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#1a1a1a"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },

  savedCarCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  selectedSavedCar: {
    borderColor: "#84c95c",
    backgroundColor: "#f6fff1",
  },
  savedCarName: { fontSize: 16, fontWeight: "600" },
  savedCarNumber: { fontSize: 14, color: "#777" },

  addNewToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeCard: {
    width: "48%",
    aspectRatio: 1.1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  selectedTypeCard: {
    borderColor: "#84c95c",
    backgroundColor: "#f0f9eb",
  },
  iconContainer: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 8,
  },
  unselectedIconContainer: { backgroundColor: "#f5f5f5" },
  selectedIconContainer: { backgroundColor: "#84c95c" },
  checkmarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  typeText: { fontSize: 14, fontWeight: "600", color: "#666" },
  selectedTypeText: { color: "#1a1a1a", fontWeight: "bold" },

  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
  },
  nextButton: {
    backgroundColor: "#C8F000",
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: { fontSize: 16, fontWeight: "bold" },
});
