import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PaymentKey =
  | "rupay"
  | "visa"
  | "mastercard"
  | "gpay"
  | "phonepe"
  | "paytm";

export default function PaymentMethods() {
  const navigation = useNavigation();

  const [defaultMethod, setDefaultMethod] =
    useState<PaymentKey>("gpay");

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentKey | null>(null);

  const confirmVisible =
    selectedMethod && selectedMethod !== defaultMethod;

  const confirmDefault = () => {
    if (!selectedMethod) return;
    setDefaultMethod(selectedMethod);
    setSelectedMethod(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Payment Methods</Text>

        {confirmVisible ? (
          <Pressable onPress={confirmDefault}>
            <Text style={styles.confirm}>Confirm</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} /> // Spacer to keep title centered
        )}
      </View>

      <Text style={styles.section}>Cards</Text>

      <PaymentItem
        icon="card-outline"
        label="RuPay •••• 1234"
        sub="Expires 08/26"
        isDefault={defaultMethod === "rupay"}
        isSelected={selectedMethod === "rupay"}
        onPress={() => setSelectedMethod("rupay")}
      />

      <PaymentItem
        icon="card-outline"
        label="VISA •••• 4242"
        sub="Expires 12/25"
        isDefault={defaultMethod === "visa"}
        isSelected={selectedMethod === "visa"}
        onPress={() => setSelectedMethod("visa")}
      />

      <PaymentItem
        icon="card-outline"
        label="Mastercard •••• 8888"
        sub="Expires 09/26"
        isDefault={defaultMethod === "mastercard"}
        isSelected={selectedMethod === "mastercard"}
        onPress={() => setSelectedMethod("mastercard")}
      />

      <Text style={styles.section}>UPI & Wallets</Text>

      <PaymentItem
        icon="logo-google"
        label="Google Pay (UPI)"
        isDefault={defaultMethod === "gpay"}
        isSelected={selectedMethod === "gpay"}
        onPress={() => setSelectedMethod("gpay")}
      />

      <PaymentItem
        icon="wallet-outline"
        label="Paytm (UPI)"
        isDefault={defaultMethod === "paytm"}
        isSelected={selectedMethod === "paytm"}
        onPress={() => setSelectedMethod("paytm")}
      />
    </View>
  );
}

const PaymentItem = ({
  icon,
  label,
  sub,
  isDefault,
  isSelected,
  onPress,
}: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.card,
      isSelected && styles.selectedCard,
      isDefault && styles.defaultCard,
    ]}
  >
    <View style={styles.row}>
      <Ionicons name={icon} size={26} color="#111827" />

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>

      {isDefault && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color="#16A34A"
        />
      )}
    </View>

    {isDefault && (
      <Text style={styles.defaultText}>
        DEFAULT PAYMENT METHOD
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
    backgroundColor: "#FFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },

  confirm: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  section: {
    marginTop: 20,
    marginBottom: 8,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  selectedCard: {
    borderWidth: 1.5,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  defaultCard: {
    borderWidth: 1.5,
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  sub: {
    color: "#777",
    marginTop: 4,
  },

  defaultText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
});
