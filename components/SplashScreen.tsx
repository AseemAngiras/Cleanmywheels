import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withTiming(1, { duration: 1500 }),
      withTiming(
        0,
        { duration: 500, easing: Easing.in(Easing.exp) },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        },
      ),
    );

    scale.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withTiming(1.1, { duration: 1500 }),
      withTiming(1.5, { duration: 1500 }),
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
