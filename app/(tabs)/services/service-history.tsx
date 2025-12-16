import { StyleSheet, Text, View } from "react-native";

export default function ServiceHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Service History</Text>
      <Text>- Basic Wash - 12/05/2025</Text>
      <Text>- Premium Wash - 15/05/2025</Text>
      <Text>- Full Service Wash - 18/05/2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
