import AdminWorkerScreen from "@/components/admin/AdminWorkerScreen";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { View } from "react-native";
import { Colors } from "@/constants/Colors";

export default function DashboardScreen() {
  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1">
        <AdminWorkerScreen />
      </View>
    </ScreenWrapper>
  );
}
