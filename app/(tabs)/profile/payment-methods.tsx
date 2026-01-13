import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaymentMethods() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Active Payment Method Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Payment Gateway</Text>
          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#166534" />
            <Text style={styles.secureText}>100% Secure</Text>
          </View>
        </View>

        <LinearGradient
          colors={["#0D1321", "#1F2937"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeCard}
        >
          <View style={styles.cardTop}>
            <Text style={styles.providerName}>Razorpay</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardDesc}>
              Seamless & secure payments for your bookings. Supports Cards, UPI,
              and Netbanking.
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <View style={styles.featureRow}>
              <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
              <Text style={styles.featureText}>End-to-End Encrypted</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Coming Soon Section */}
        <Text
          style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}
        >
          Coming Soon
        </Text>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="logo-google" size={24} color="#2563EB" />
            </View>
            <Text style={styles.gridLabel}>Google Pay</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FDF2F8" }]}>
              <Ionicons name="wallet-outline" size={24} color="#DB2777" />
            </View>
            <Text style={styles.gridLabel}>PhonePe</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="card-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.gridLabel}>Saved Cards</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="cash-outline" size={24} color="#EA580C" />
            </View>
            <Text style={styles.gridLabel}>Pay Later</Text>
          </View>
        </View>

        {/* Info Box */}
        {/* <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            We are working on adding direct wallet integration and saved cards
            feature in the next update.
          </Text>
        </View> */}
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  secureText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  activeCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  providerName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  activeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 20,
  },
  cardDesc: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
  },
  cardBottom: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
