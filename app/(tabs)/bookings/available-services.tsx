import { Button, StyleSheet, Text, View } from "react-native";

export default function AvailableServicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Car Wash Services</Text>
      <Text>- Basic Wash</Text>
      <Text>- Premium Wash</Text>
      <Text>- Interior Detailing</Text>
      <Text>- Full Service Wash</Text>

      <Button title="Book Now" onPress={() => console.log("Booking a service...")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
