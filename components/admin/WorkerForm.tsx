import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { InteractivePressable } from "../ui/InteractivePressable";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";

interface WorkerFormProps {
  initialValues?: {
    name: string;
    phone: string;
    jobRole: string;
    address: string;
    status: string;
  };
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}

export const WorkerForm: React.FC<WorkerFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [jobRole, setJobRole] = useState(initialValues?.jobRole || "");
  const [address, setAddress] = useState(initialValues?.address || "");
  const [status, setStatus] = useState(initialValues?.status || "Active");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);
  const [isPhoneWarningVisible, setIsPhoneWarningVisible] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !jobRole) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    await onSubmit({ name, phone, jobRole, address, status });
  };

  return (
    <View className="bg-card px-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Name Input */}
        <View className="mb-6 mt-2">
          <View className="flex-row items-center gap-2 mb-2.5 px-1">
            <Ionicons
              name="person-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-[13px] font-[700] color-textSecondary uppercase tracking-widest">
              Full Name *
            </Text>
          </View>
          <TextInput
            className="bg-background border-[1.5px] border-border rounded-2xl p-4 text-[16px] color-text font-[600]"
            value={name}
            onChangeText={(text) => {
              if (/[^a-zA-Z\s]/.test(text)) {
                setIsNameWarningVisible(true);
                setTimeout(() => setIsNameWarningVisible(false), 3000);
              }
              const filteredText = text.replace(/[^a-zA-Z\s]/g, "");
              setName(filteredText);
            }}
            autoCapitalize="words"
            maxLength={30}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#64748B"
          />
          {isNameWarningVisible && (
            <Text className="text-[11px] color-red-500 font-[600] mt-1.5 ml-1">
              Only alphabets are allowed
            </Text>
          )}
        </View>

        {/* Phone Input */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-2.5 px-1">
            <Ionicons
              name="call-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-[13px] font-[700] color-textSecondary uppercase tracking-widest">
              Phone Number *
            </Text>
          </View>
          <View className="flex-row items-center bg-background border-[1.5px] border-border rounded-2xl h-14 px-4">
            <Text className="text-[16px] color-text font-[700]">+91</Text>
            <View className="w-[1.5px] h-6 bg-border mx-3" />
            <TextInput
              className="flex-1 text-[16px] color-text font-[600]"
              value={phone}
              onChangeText={(text) => {
                if (/[^0-9]/.test(text)) {
                  setIsPhoneWarningVisible(true);
                  setTimeout(() => setIsPhoneWarningVisible(false), 3000);
                }
                const filteredText = text.replace(/[^0-9]/g, "");
                setPhone(filteredText);
              }}
              placeholder="9876543210"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {isPhoneWarningVisible && (
            <Text className="text-[11px] color-red-500 font-[600] mt-1.5 ml-1">
              Only numbers are allowed
            </Text>
          )}
        </View>

        {/* Job Role Input */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-2.5 px-1">
            <Ionicons
              name="briefcase-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-[13px] font-[700] color-textSecondary uppercase tracking-widest">
              Job Role *
            </Text>
          </View>
          <TextInput
            className="bg-background border-[1.5px] border-border rounded-2xl p-4 text-[16px] color-text font-[600]"
            value={jobRole}
            onChangeText={setJobRole}
            placeholder="e.g. Cleaner, Supervisor"
            placeholderTextColor="#64748B"
          />
        </View>

        {/* Address Input */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-2.5 px-1">
            <Ionicons
              name="location-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-[13px] font-[700] color-textSecondary uppercase tracking-widest">
              Address
            </Text>
          </View>
          <TextInput
            className="bg-background border-[1.5px] border-border rounded-2xl p-4 text-[16px] color-text font-[600] h-24 text-top"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter full address"
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Status Picker */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-2.5 px-1">
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-[13px] font-[700] color-textSecondary uppercase tracking-widest">
              Initial Status
            </Text>
          </View>
          <View className="bg-background border-[1.5px] border-border rounded-2xl overflow-hidden">
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              dropdownIconColor={Colors.textSecondary}
              style={{ marginVertical: -4 }}
            >
              <Picker.Item label="Active" value="Active" color={Colors.text} />
              <Picker.Item
                label="Inactive"
                value="Inactive"
                color={Colors.text}
              />
              <Picker.Item
                label="On Leave"
                value="On Leave"
                color={Colors.text}
              />
            </Picker>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-4 mt-4">
          <InteractivePressable
            className="flex-1 h-14 bg-background border border-border rounded-2xl items-center justify-center shadow-sm"
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text className="text-[15px] font-[800] color-textSecondary">
              Cancel
            </Text>
          </InteractivePressable>

          <InteractivePressable
            className="flex-[2] h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-[15px] font-[900] color-black tracking-tight">
                {submitLabel}
              </Text>
            )}
          </InteractivePressable>
        </View>
      </ScrollView>
    </View>
  );
};
