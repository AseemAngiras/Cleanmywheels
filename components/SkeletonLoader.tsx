import React, { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  className?: string;
}

// Single skeleton element
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  className,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return (
    <Animated.View
      className={`bg-white/10 ${className || ""}`}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Service card skeleton
export const ServiceCardSkeleton: React.FC = () => (
  <View className="bg-card rounded-[24px] p-5 mb-4 mx-5 border border-border">
    <View className="flex-row items-center">
      <Skeleton width={60} height={60} borderRadius={16} />
      <View className="flex-1 ml-4">
        <Skeleton width="70%" height={18} className="mb-2" />
        <Skeleton width="50%" height={14} className="mb-2" />
        <Skeleton width="30%" height={16} />
      </View>
    </View>
  </View>
);

// Booking card skeleton
export const BookingCardSkeleton: React.FC = () => (
  <View className="bg-card rounded-[24px] p-5 mb-4 mx-5 border border-border">
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center">
        <Skeleton width={50} height={50} borderRadius={12} />
        <View className="flex-1 ml-3">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    <View className="h-[1px] bg-border/50 mb-4" />
    <View className="gap-2.5">
      <View className="flex-row items-center">
        <Skeleton width={20} height={20} borderRadius={6} />
        <Skeleton width="50%" height={14} className="ml-3" />
      </View>
      <View className="flex-row items-center">
        <Skeleton width={20} height={20} borderRadius={6} />
        <Skeleton width="40%" height={14} className="ml-3" />
      </View>
    </View>
  </View>
);

// Notification item skeleton
export const NotificationSkeleton: React.FC = () => (
  <View className="flex-row items-start p-5 bg-card border-b border-border/50">
    <Skeleton width={44} height={44} borderRadius={14} />
    <View className="flex-1 ml-4">
      <Skeleton width="80%" height={16} className="mb-2" />
      <Skeleton width="60%" height={14} className="mb-2" />
      <Skeleton width="30%" height={12} />
    </View>
  </View>
);

// Profile card skeleton
export const ProfileSkeleton: React.FC = () => (
  <View className="flex-row items-center bg-card rounded-[24px] p-5 mb-5 border border-border">
    <Skeleton width={64} height={64} borderRadius={32} />
    <View className="ml-4 flex-1">
      <Skeleton width="60%" height={18} className="mb-2" />
      <Skeleton width="50%" height={14} className="mb-2" />
      <Skeleton width="70%" height={14} />
    </View>
  </View>
);

// Address row skeleton
export const AddressRowSkeleton: React.FC = () => (
  <View className="flex-row items-center py-4 px-5 border-b border-border/50">
    <Skeleton width={40} height={40} borderRadius={12} />
    <View className="flex-1 ml-4">
      <Skeleton width="30%" height={14} className="mb-2" />
      <Skeleton width="80%" height={12} />
    </View>
  </View>
);

// Full page loading skeleton (for lists)
interface ListSkeletonProps {
  count?: number;
  type: "service" | "booking" | "notification" | "address";
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 3,
  type,
}) => {
  const renderItem = () => {
    switch (type) {
      case "service":
        return <ServiceCardSkeleton />;
      case "booking":
        return <BookingCardSkeleton />;
      case "notification":
        return <NotificationSkeleton />;
      case "address":
        return <AddressRowSkeleton />;
      default:
        return <ServiceCardSkeleton />;
    }
  };

  return (
    <View>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <View key={`skeleton-${index}`}>{renderItem()}</View>
        ))}
    </View>
  );
};
