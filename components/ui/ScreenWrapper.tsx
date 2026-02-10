import React from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
  StatusBarStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  statusBarStyle?: StatusBarStyle;
  translucent?: boolean;
  useSafeArea?: boolean;
  background?: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor = "transparent",
  statusBarColor = "transparent",
  statusBarStyle = "dark-content",
  translucent = true,
  useSafeArea = true,
  background,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={translucent}
      />
      {background}
      <View style={[styles.content, useSafeArea && { paddingTop: insets.top }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
