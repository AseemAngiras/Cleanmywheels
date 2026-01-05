import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Single skeleton element
export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
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
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Service card skeleton
export const ServiceCardSkeleton: React.FC = () => (
  <View style={styles.serviceCard}>
    <View style={styles.serviceRow}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={styles.serviceContent}>
        <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={16} />
      </View>
    </View>
  </View>
);

// Booking card skeleton
export const BookingCardSkeleton: React.FC = () => (
  <View style={styles.bookingCard}>
    <View style={styles.bookingHeader}>
      <Skeleton width={50} height={50} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    <View style={styles.bookingDivider} />
    <View style={styles.bookingDetails}>
      <View style={styles.bookingDetailRow}>
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width="50%" height={14} style={{ marginLeft: 8 }} />
      </View>
      <View style={styles.bookingDetailRow}>
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width="40%" height={14} style={{ marginLeft: 8 }} />
      </View>
    </View>
  </View>
);

// Notification item skeleton
export const NotificationSkeleton: React.FC = () => (
  <View style={styles.notificationItem}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={12} />
    </View>
  </View>
);

// Profile card skeleton
export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profileCard}>
    <Skeleton width={60} height={60} borderRadius={30} />
    <View style={{ marginLeft: 14, flex: 1 }}>
      <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
      <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="70%" height={14} />
    </View>
  </View>
);

// Address row skeleton
export const AddressRowSkeleton: React.FC = () => (
  <View style={styles.addressRow}>
    <Skeleton width={36} height={36} borderRadius={8} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Skeleton width="30%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={12} />
    </View>
  </View>
);

// Full page loading skeleton (for lists)
interface ListSkeletonProps {
  count?: number;
  type: 'service' | 'booking' | 'notification' | 'address';
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 3, type }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const renderItem = () => {
    switch (type) {
      case 'service':
        return <ServiceCardSkeleton />;
      case 'booking':
        return <BookingCardSkeleton />;
      case 'notification':
        return <NotificationSkeleton />;
      case 'address':
        return <AddressRowSkeleton />;
      default:
        return <ServiceCardSkeleton />;
    }
  };

  return (
    <View>
      {items.map((_, index) => (
        <View key={index}>{renderItem()}</View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceContent: {
    flex: 1,
    marginLeft: 14,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  bookingDetails: {
    gap: 8,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
});
