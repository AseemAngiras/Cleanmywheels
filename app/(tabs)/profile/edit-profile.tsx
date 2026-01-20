import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useUpdateProfileMutation } from "../../../store/api/authApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfile } from "../../../store/slices/profileSlice";
import { updateUser } from "../../../store/slices/userSlice";

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const user = useAppSelector((state) => state.user);

  const [fullName, setFullName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState(profile.email ?? "");

  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  const saveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const userName = user?.user?.name || profile?.name || "";
    const userPhone = user?.user?.phone || profile?.phone || "";
    setFullName(userName);
    setMobile(userPhone);
  }, [user?.user?.name, user?.user?.phone, profile?.name, profile?.phone]);

  useEffect(() => {
    const originalName = user?.user?.name || profile?.name || "";
    const originalPhone = user?.user?.phone || profile?.phone || "";
    const changes =
      fullName !== originalName ||
      mobile !== originalPhone ||
      email !== (profile.email ?? "");

    setHasChanges(changes);

    Animated.timing(saveAnim, {
      toValue: changes ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fullName, mobile, email, profile, user, saveAnim]);

  const [updateUserProfileAPI, { isLoading: isUpdating }] =
    useUpdateProfileMutation();
  const token = useAppSelector((state) => state.auth.token);

  const handleSave = async () => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    try {
      await updateUserProfileAPI({
        name: fullName,
        email: email,
      }).unwrap();

      dispatch(
        updateUser({
          name: fullName,
          email: email,
        }),
      );

      dispatch(updateProfile({ key: "name", value: fullName }));
      dispatch(updateProfile({ key: "email", value: email }));

      setFocusedInput(null);
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error: any) {
      console.error("Update Profile Error", error);
      Alert.alert("Error", error?.data?.message || "Failed to update profile");
    }
  };

  const getInputStyle = (inputName: string) => [
    styles.input,
    focusedInput === inputName && styles.inputFocused,
  ];

  const saveButtonTranslateX = saveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const saveButtonOpacity = saveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        {/* Animated Save Button */}
        <Animated.View
          style={[
            styles.saveButtonContainer,
            {
              opacity: saveButtonOpacity,
              transform: [{ translateX: saveButtonTranslateX }],
            },
          ]}
        >
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#000" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* PROFILE FIELDS */}
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={getInputStyle("fullName")}
            onFocus={() => setFocusedInput("fullName")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            style={getInputStyle("mobile")}
            onFocus={() => setFocusedInput("mobile")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={getInputStyle("email")}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 20,
    backgroundColor: "#F3F4F7",
    position: "relative",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "400",
    color: "#111",
    position: "absolute",
    left: 70,
    paddingTop: 70,
    textAlign: "center",
  },

  saveButtonContainer: {
    position: "absolute",
    right: 20,
    top: 90,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#C8F000",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  saveText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
    marginBottom: 8,
  },

  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },

  inputFocused: {
    borderColor: "#C8F000",
    backgroundColor: "#fff",
  },
});
