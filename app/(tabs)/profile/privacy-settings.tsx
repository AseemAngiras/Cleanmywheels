import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HelpSupport() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={26}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.title}>Help & Support</Text>

        {/* Spacer to keep title centered */}
        <View style={{ width: 26 }} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.section}>Quick Help</Text>

      <SupportItem
        icon="help-circle-outline"
        title="FAQs"
        subtitle="Find answers to common questions"
      />

      <SupportItem
        icon="chatbubble-ellipses-outline"
        title="Chat with Support"
        subtitle="Get help from our support team"
      />

      <SupportItem
        icon="call-outline"
        title="Call Support"
        subtitle="Speak directly with an agent"
      />

      {/* Account & Payments */}
      <Text style={styles.section}>Account & Payments</Text>

      <SupportItem
        icon="person-circle-outline"
        title="Account Issues"
        subtitle="Login, profile & security help"
      />

      <SupportItem
        icon="card-outline"
        title="Payment & Refunds"
        subtitle="UPI, cards, and refund status"
      />
    </View>
  );
}

const SupportItem = ({
  icon,
  title,
  subtitle,
}: any) => (
  <Pressable style={styles.card}>
    <View style={styles.row}>
      <Ionicons name={icon} size={26} color="#111827" />

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color="#9CA3AF"
      />
    </View>
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
    marginBottom: 12,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
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
    fontSize: 14,
  },
});
