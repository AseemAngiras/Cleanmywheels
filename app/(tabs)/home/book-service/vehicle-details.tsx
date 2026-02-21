import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCar } from "@/store/slices/userSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function VehicleDetailsScreen() {
  const dispatch = useAppDispatch();
  const cars = useAppSelector((state) => state.user.cars);

  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(cars.length === 0);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  const vehicleTypes = [
    { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
    { id: "Sedan", name: "Sedan", icon: "car" },
    { id: "SUV", name: "SUV", icon: "car-estate" },
    { id: "Other", name: "Others", icon: "truck-delivery" },
  ];

  const handleNext = () => {
    let finalCar;

    if (selectedCarId) {
      finalCar = cars.find((c) => c.id === selectedCarId);
    }

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

      dispatch(addCar(finalCar));
    }

    if (!finalCar) return;

    // Based on the flow, it likely goes to select-service or similar
    // For now we just go back or to the next logical step if defined in params
    router.back();
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center px-5 py-4 bg-background">
              <TouchableOpacity onPress={() => router.back()} className="p-1">
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text className="text-[18px] font-[800] color-text tracking-tight">
                Vehicle Details
              </Text>
              <View className="w-8" />
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 150 + insets.bottom,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Saved Cars Section */}
              {cars.length > 0 && (
                <View className="mb-10">
                  <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
                    Select Saved Vehicle
                  </Text>

                  {cars.map((car) => {
                    const isSelected = selectedCarId === car.id;
                    return (
                      <TouchableOpacity
                        key={car.id}
                        className={`flex-row justify-between items-center p-5 rounded-[24px] mb-4 border ${
                          isSelected
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-card border-border/50"
                        }`}
                        onPress={() => {
                          setSelectedCarId(car.id);
                          setAddingNew(false);
                        }}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${isSelected ? "bg-primary" : "bg-background"}`}
                          >
                            <MaterialCommunityIcons
                              name={
                                car.type === "Sedan"
                                  ? "car"
                                  : car.type === "Hatchback"
                                    ? "car-hatchback"
                                    : car.type === "SUV"
                                      ? "car-estate"
                                      : "car-info"
                              }
                              size={24}
                              color={isSelected ? "#000" : Colors.textSecondary}
                            />
                          </View>
                          <View>
                            <Text
                              className={`text-[16px] font-[800] ${isSelected ? "color-text" : "color-text"}`}
                            >
                              {car.name}
                            </Text>
                            <Text className="text-[13px] color-textSecondary font-[600] mt-0.5">
                              {car.number}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View className="bg-primary/20 w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={Colors.primary}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    className="flex-row items-center mt-2 px-2"
                    onPress={() => {
                      setAddingNew(true);
                      setSelectedCarId(null);
                    }}
                  >
                    <View className="bg-primary/10 w-6 h-6 rounded-full items-center justify-center mr-3">
                      <Ionicons name="add" size={16} color={Colors.primary} />
                    </View>
                    <Text className="text-[14px] font-[700] color-textSecondary italic">
                      Add another vehicle
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Add New Vehicle Section */}
              {addingNew && (
                <View>
                  <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
                    Vehicle Type
                  </Text>

                  <View className="flex-row flex-wrap justify-between mb-8">
                    {vehicleTypes.map((type) => {
                      const isSelected = vehicleType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          className={`w-[48%] aspect-[1.1] rounded-[32px] justify-center items-center mb-4 border relative ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "bg-card border-border/50"
                          }`}
                          onPress={() => setVehicleType(type.id)}
                        >
                          {isSelected && (
                            <View className="absolute top-4 right-4 bg-primary rounded-full w-6 h-6 items-center justify-center">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#000"
                              />
                            </View>
                          )}
                          <View
                            className={`w-16 h-16 rounded-3xl items-center justify-center mb-3 ${isSelected ? "bg-primary" : "bg-background"}`}
                          >
                            <MaterialCommunityIcons
                              name={type.icon as any}
                              size={32}
                              color={isSelected ? "#000" : Colors.textSecondary}
                            />
                          </View>
                          <Text
                            className={`text-[14px] font-[800] ${isSelected ? "color-text" : "color-textSecondary"}`}
                          >
                            {type.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-4 px-1">
                    Vehicle Number
                  </Text>
                  <View className="bg-card border border-border rounded-[20px] px-5 h-16 flex-row items-center shadow-sm">
                    <MaterialCommunityIcons
                      name="numeric"
                      size={24}
                      color={Colors.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <TextInput
                      className="flex-1 text-[16px] color-text font-[700]"
                      placeholder="e.g. MH 01 AB 1234"
                      placeholderTextColor="#64748B"
                      value={vehicleNumber}
                      onChangeText={setVehicleNumber}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Action */}
            <View
              className="absolute bottom-0 left-0 right-0 bg-card p-6 rounded-t-[40px] border-t border-border shadow-2xl"
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
              <TouchableOpacity
                className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
                onPress={handleNext}
              >
                <Text className="text-[16px] font-[900] color-black">
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#000"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
