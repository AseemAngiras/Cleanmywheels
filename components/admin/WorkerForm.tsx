import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

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

  const handleSubmit = async () => {
    if (!name || !phone || !jobRole) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    await onSubmit({ name, phone, jobRole, address, status });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={16} color="#64748B" />
            <Text style={styles.label}>Full Name *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="call-outline" size={16} color="#64748B" />
            <Text style={styles.label}>Phone Number *</Text>
          </View>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefix}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="briefcase-outline" size={16} color="#64748B" />
            <Text style={styles.label}>Job Role *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={jobRole}
            onChangeText={setJobRole}
            placeholder="e.g. Cleaner, Supervisor"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.label}>Address</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter full address"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.label}>Initial Status</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Active" value="Active" />
              <Picker.Item label="Inactive" value="Inactive" />
              <Picker.Item label="On Leave" value="On Leave" />
            </Picker>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FFF",
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 14,
  },
  prefix: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  pickerContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    marginTop: -8,
    marginBottom: -8,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  submitButton: {
    backgroundColor: "#C8F000", // Lime theme color
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 16,
  },
  submitButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
