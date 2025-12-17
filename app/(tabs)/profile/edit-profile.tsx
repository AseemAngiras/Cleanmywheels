import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProfile() {
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=3"
  );

  const [fullName, setFullName] = useState("John Doe");
  const [mobile, setMobile] = useState("+91 98765 43210");
  const [tempMobile, setTempMobile] = useState(mobile);
  const [isEditingMobile, setIsEditingMobile] = useState(false);

  const [email, setEmail] = useState("john.doe@example.com");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  const [dob, setDob] = useState(new Date(1990, 4, 15));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const openImageOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        index => {
          if (index === 1) openCamera();
          if (index === 2) openGallery();
        }
      );
    } else {
      Alert.alert("Update Profile Picture", "", [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo access is needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleMobileAction = () => {
    if (isEditingMobile) {
      setMobile(tempMobile);
      setIsEditingMobile(false);
    } else {
      setTempMobile(mobile);
      setIsEditingMobile(true);
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const formatDate = (date: Date) =>
    `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate()
    ).padStart(2, "0")}/${date.getFullYear()}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE IMAGE */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: profileImage }} style={styles.avatar} />
        <TouchableOpacity style={styles.editAvatar} onPress={openImageOptions}>
          <Ionicons name="pencil-outline" size={14} color="#000" />
        </TouchableOpacity>
      </View>

      {/* FULL NAME */}
      <Text style={styles.label}>Full Name</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        <Ionicons name="person-outline" size={18} color="#999" />
      </View>

      {/* MOBILE */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.verifiedRow}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.verified}>Verified</Text>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          value={isEditingMobile ? tempMobile : mobile}
          onChangeText={setTempMobile}
          editable={isEditingMobile}
          keyboardType="phone-pad"
          style={[
            styles.input,
            !isEditingMobile && styles.disabledInput,
          ]}
        />
        <TouchableOpacity onPress={handleMobileAction}>
          <Text style={styles.change}>
            {isEditingMobile ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* EMAIL */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Ionicons name="mail-outline" size={18} color="#999" />
      </View>

      {/* GENDER */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {["Male", "Female", "Other"].map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.genderBtn,
              gender === item && styles.genderActive,
            ]}
            onPress={() => setGender(item as any)}
          >
            <Text
              style={[
                styles.genderText,
                gender === item && styles.genderTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DOB */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.input}>{formatDate(dob)}</Text>
        <Ionicons name="calendar-outline" size={18} color="#999" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 26, fontWeight: "700" },
  save: { color: "#F5B700", fontSize: 16, fontWeight: "600" },

  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#FFD400",
    borderRadius: 14,
    padding: 6,
  },

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
  input: { flex: 1, fontSize: 15 },
  disabledInput: { color: "#999" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedRow: { flexDirection: "row", alignItems: "center" },
  verified: { fontSize: 12, color: "#4CAF50", marginLeft: 4 },
  change: { color: "#F5B700", fontWeight: "600" },

  genderRow: { flexDirection: "row", marginBottom: 20 },
  genderBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  genderActive: {
    backgroundColor: "#FFF7D6",
    borderColor: "#FFD400",
  },
  genderText: { color: "#666" },
  genderTextActive: { fontWeight: "600", color: "#000" },
});
