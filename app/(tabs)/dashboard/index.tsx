import AdminWorkerScreen from "@/components/admin/AdminWorkerScreen";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { StyleSheet, View } from "react-native";

export default function DashboardScreen() {
  return (
    <ScreenWrapper style={styles.container} backgroundColor="#fff">
      <View style={styles.content}>
        <AdminWorkerScreen />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
});
