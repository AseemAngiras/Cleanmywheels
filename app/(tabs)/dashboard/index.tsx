import AdminWorkerScreen from "@/components/admin/AdminWorkerScreen";
import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AdminWorkerScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
});
