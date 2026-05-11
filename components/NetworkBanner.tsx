import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NetworkBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false;
      setIsOffline(offline);

      Animated.spring(translateY, {
        toValue: offline ? 0 : -100,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline && translateY._value === -100) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 10,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={16} color="#FFF" />
        <Text style={styles.text}>
          You are currently offline. Viewing cached data.
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#EF4444",
    zIndex: 9999,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
});
