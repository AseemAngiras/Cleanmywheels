import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfile } from "../../../store/slices/profileSlice";

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);

  const [fullName, setFullName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.phone);
  const [tempMobile, setTempMobile] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email ?? "");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSave = () => {
    dispatch(updateProfile({ key: "name", value: fullName }));
    dispatch(updateProfile({ key: "phone", value: tempMobile }));
    dispatch(updateProfile({ key: "email", value: email }));

    setMobile(tempMobile);
    setFocusedInput(null);

    router.back();
  };

  const getInputStyle = (inputName: string) => [
    styles.input,
    focusedInput === inputName && styles.inputFocused,
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>

        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* FULL NAME */}
      <Text style={styles.label}>Full Name</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={getInputStyle("fullName")}
          onFocus={() => setFocusedInput("fullName")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* MOBILE */}
      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={tempMobile}
          onChangeText={setTempMobile}
          keyboardType="phone-pad"
          style={getInputStyle("mobile")}
          onFocus={() => setFocusedInput("mobile")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* EMAIL */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={getInputStyle("email")}
          keyboardType="email-address"
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 26, fontWeight: "700" },
  save: { color: "#000", fontSize: 16, fontWeight: "600" },

  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: { flex: 1, fontSize: 15, borderWidth: 1, borderColor: "transparent", borderRadius: 12, padding: 8 },
  inputFocused: { borderColor: "#4CAF50" }, 
});
