import React from "react";
import { StatusBar, View, ViewStyle, StatusBarStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
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
  className,
  backgroundColor,
  statusBarColor = "transparent",
  statusBarStyle = "light-content",
  translucent = true,
  useSafeArea = true,
  background,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 ${className || ""}`}
      style={[{ backgroundColor: backgroundColor || "#111111" }, style]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={translucent}
      />
      {background}
      <View
        className="flex-1"
        style={[useSafeArea && { paddingTop: insets.top }]}
      >
        {children}
      </View>
    </View>
  );
};
