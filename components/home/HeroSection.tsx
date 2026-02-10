import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export const HeroSection = ({ isLoggedIn = false }: HeroSectionProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(
      isLoggedIn
        ? "/(tabs)/subscriptions"
        : "/(tabs)/home/book-doorstep/enter-location",
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
          }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <Text style={styles.eliteText}>ELITE</Text>
              <Text style={styles.shineText}>
                <Text style={styles.shineHighlight}>SHINE</Text> SYSTEM
              </Text>

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handlePress}
              >
                <Text style={styles.buttonText}>EXPLORE SPECS</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  cardContainer: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  imageBackground: {
    width: "100%",
    height: 220,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  imageStyle: {
    borderRadius: 24,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  content: {
    alignItems: "flex-start",
  },
  eliteText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 1,
    lineHeight: 32,
  },
  shineText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 1,
    lineHeight: 32,
    marginBottom: 20,
  },
  shineHighlight: {
    color: "#C8F000",
  },
  button: {
    borderWidth: 2,
    borderColor: "#C8F000",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: "#C8F000",
    fontSize: 14,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
