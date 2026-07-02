import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

export const NetworkBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Use a lightweight HEAD request to check connectivity without native modules
        const response = await fetch("https://www.google.com", { 
          method: "HEAD",
          mode: 'no-cors',
          cache: 'no-store'
        });
        const offline = !response.ok && response.status !== 0; // status 0 is common for no-cors success
        updateOfflineState(false);
      } catch (e) {
        updateOfflineState(true);
      }
    };

    const updateOfflineState = (offline: boolean) => {
      if (offline !== isOffline) {
        setIsOffline(offline);
        Animated.spring(translateY, {
          toValue: offline ? 0 : -100,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      }
    };

    const interval = setInterval(checkNetwork, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [isOffline]);

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 bg-red-500 z-[9999] px-2 shadow-xl"
      style={{
        transform: [{ translateY }],
        paddingTop: insets.top + 10,
      }}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="cloud-offline" size={16} color="#FFF" />
        <Text className="text-white text-[12px] font-bold ml-2">
          You are currently offline. Viewing cached data.
        </Text>
      </View>
    </Animated.View>
  );
};
