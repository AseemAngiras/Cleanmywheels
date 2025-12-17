import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

export default function Notifications() {
  const [state, setState] = useState({
    booking: true,
    reminder: true,
    promo: false,
    updates: true,
    general: true,
  });

  const Item = ({
    label,
    value,
    keyName,
    icon,
  }: {
    label: string;
    value: boolean;
    keyName: keyof typeof state;
    icon: any;
  }) => (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color="#1F1F1F" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={(v) => setState({ ...state, [keyName]: v })}
        trackColor={{ false: "#E5E7EB", true: "#9ED36A" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <Item
        label="Booking Confirmations"
        value={state.booking}
        keyName="booking"
        icon="ticket-outline"
      />
      <Item
        label="Booking Reminders"
        value={state.reminder}
        keyName="reminder"
        icon="time-outline"
      />
      <Item
        label="Promotions & Offers"
        value={state.promo}
        keyName="promo"
        icon="pricetag-outline"
      />
      <Item
        label="App Updates"
        value={state.updates}
        keyName="updates"
        icon="download-outline"
      />
      <Item
        label="General Announcements"
        value={state.general}
        keyName="general"
        icon="megaphone-outline"
      />

      <Pressable
        onPress={() =>
          setState({
            booking: false,
            reminder: false,
            promo: false,
            updates: false,
            general: false,
          })
        }
      >
        <Text style={styles.clear}>Clear All Notifications</Text>
      </Pressable>

      <Text style={styles.version}>Version 2.4.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5EEDD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  clear: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
    fontSize: 15,
  },
  version: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    color: "#9CA3AF",
  },
});
