import AdminWorkerScreen from "@/components/admin/AdminWorkerScreen";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { View, BackHandler } from "react-native";
import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "expo-router";
import React from "react";

export default function DashboardScreen() {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Stay on dashboard if they are on the main admin screen
        return true; 
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

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
