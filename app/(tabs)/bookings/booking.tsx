import { Button, StyleSheet, Text, View } from "react-native";

export default function BookingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Your Car Wash</Text>
      <Button title="Confirm Booking" onPress={() => console.log("Service booked!")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
