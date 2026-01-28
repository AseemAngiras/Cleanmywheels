import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const CAROUSEL_DATA = [
  {
    id: "1",
    title: "Premium\nCar Care",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
    buttonText: "EXPLORE",
    route: "/(tabs)/subscriptions",
  },
  {
    id: "2",
    title: "Eco-Friendly\nWash",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
    buttonText: "LEARN MORE",
    route: "/(tabs)/subscriptions",
  },
  {
    id: "3",
    title: "Interior\nDetailing",
    image:
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    buttonText: "BOOK NOW",
    route: "/(tabs)/home/book-doorstep/enter-location",
  },
];

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export const HeroSection = ({ isLoggedIn = false }: HeroSectionProps) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const GUEST_ROUTE = "/(tabs)/home/book-doorstep/enter-location"; // Force guest to booking

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  const renderItem = ({ item }: { item: (typeof CAROUSEL_DATA)[0] }) => {
    const handlePress = () => {
      // If logged in, go to specific banner route. If guest, always go to enter-location.
      const targetRoute = isLoggedIn ? item.route : GUEST_ROUTE;
      router.push(targetRoute as any);
    };

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.overlay} />
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.button}
              onPress={handlePress}
            >
              <Text style={styles.buttonText}>{item.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CAROUSEL_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ alignItems: "center" }}
      />

      <View style={styles.pagination}>
        {CAROUSEL_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  cardContainer: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "right",
    lineHeight: 30,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  pagination: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    pointerEvents: "none",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 16,
    height: 6,
    borderRadius: 3,
  },
});
