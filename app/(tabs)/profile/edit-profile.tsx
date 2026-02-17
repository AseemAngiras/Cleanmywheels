import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useUpdateProfileMutation } from "../../../store/api/authApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfile } from "../../../store/slices/profileSlice";
import { updateUser } from "../../../store/slices/userSlice";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const user = useAppSelector((state) => state.user);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(profile.email ?? "");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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

  const [updateUserProfileAPI] = useUpdateProfileMutation();
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

  const saveButtonTranslateX = saveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const saveButtonOpacity = saveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>

          <Text className="text-[20px] font-[700] text-text">Edit Profile</Text>

          <Animated.View
            style={{
              opacity: saveButtonOpacity,
              transform: [{ translateX: saveButtonTranslateX }],
            }}
          >
            <TouchableOpacity
              className="flex-row items-center py-2 px-4 bg-primary rounded-full shadow-md"
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text className="text-black text-[14px] font-[700] ml-1.5">
                Save
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        >
          {/* PROFILE FIELDS */}
          <View className="bg-card rounded-[24px] p-5 mb-5 border border-border shadow-sm">
            <Text className="text-[14px] font-[600] text-textSecondary mb-2.5 ml-1">
              Full Name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={(text) => {
                if (/[^a-zA-Z\s]/.test(text)) {
                  setIsNameWarningVisible(true);
                  setTimeout(() => setIsNameWarningVisible(false), 3000);
                }
                setFullName(text.replace(/[^a-zA-Z\s]/g, ""));
              }}
              className={`text-base text-text py-3.5 px-4 bg-background rounded-2xl border ${
                focusedInput === "fullName" ? "border-primary" : "border-border"
              }`}
              onFocus={() => setFocusedInput("fullName")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter full name"
              placeholderTextColor={Colors.textSecondary}
            />
            {isNameWarningVisible && (
              <Text className="text-error text-[12px] mt-1.5 ml-1">
                Only alphabets are allowed
              </Text>
            )}
          </View>

          <View className="bg-card rounded-[24px] p-5 mb-5 border border-border shadow-sm">
            <Text className="text-[14px] font-[600] text-textSecondary mb-2.5 ml-1">
              Mobile Number
            </Text>
            <View
              className={`flex-row items-center py-3.5 px-4 bg-background rounded-2xl border ${
                focusedInput === "mobile" ? "border-primary" : "border-border"
              } opacity-70`}
            >
              <Text className="text-base text-text font-[600] mr-2">+91</Text>
              <View className="w-[1px] h-5 bg-border mr-3" />
              <TextInput
                value={mobile}
                editable={false}
                className="flex-1 text-base text-text"
                onFocus={() => setFocusedInput("mobile")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            <Text className="text-[11px] text-textSecondary mt-2 ml-1">
              Mobile number cannot be changed
            </Text>
          </View>

          <View className="bg-card rounded-[24px] p-5 mb-5 border border-border shadow-sm">
            <Text className="text-[14px] font-[600] text-textSecondary mb-2.5 ml-1">
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`text-base text-text py-3.5 px-4 bg-background rounded-2xl border ${
                focusedInput === "email" ? "border-primary" : "border-border"
              }`}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter email address"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
