import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InteractivePressable } from '../ui/InteractivePressable';
import { type Booking } from '../../types';

interface BookingItemProps {
  item: Booking;
  onPress: (item: Booking) => void;
}

export const BookingItem = React.memo(({ item, onPress }: BookingItemProps) => {
  return (
    <InteractivePressable
      className="mb-[10px]"
      onPress={() => onPress(item)}
    >
      <View className="bg-card rounded-[20px] p-5 pb-20 m-3 border border-border shadow-lg shadow-black/10 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-[700] text-text">
            {item.center}
          </Text>
          <Text className="mt-1 text-base font-[600] text-textSecondary">
            {item.date} - {item.timeSlot}
          </Text>
          <Text className="mt-[6px] text-sm text-textSecondary">
            {item.car}
          </Text>

          {/* Worker Badge */}
          <View className="flex-row items-center mt-2">
            <View
              className={`flex-row items-center px-2 py-1 rounded-md border ${
                item.workerName
                  ? "bg-success/5 border-success/20"
                  : "bg-warning/5 border-warning/20"
              }`}
            >
              <Ionicons
                name={item.workerName ? "person" : "hourglass-outline"}
                size={12}
                color={item.workerName ? "#10B981" : "#F59E0B"}
              />
              <Text
                className={`text-[11px] font-[700] ml-1 uppercase text-white ${
                  item.workerName ? "text-success" : "text-warning"
                }`}
              >
                {item.workerName
                  ? `Valet: ${item.workerName}`
                  : "Assignment Pending"}
              </Text>
            </View>
          </View>

          {item.addons && item.addons.length > 0 && (
            <View className="flex-row items-center mt-2 bg-primary/10 self-start px-2 py-1 rounded-md border border-primary/20">
              <Ionicons
                name="add-circle"
                size={12}
                color={Colors.primary}
              />
              <Text className="text-[11px] font-[700] text-primary ml-1 uppercase">
                +{item.addons.length} Add-on
                {item.addons.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Stylized Icon to fill space */}
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
          <Ionicons
            name={
              item.car.toLowerCase().includes("two")
                ? "car-sport"
                : "car-sport"
            }
            size={32}
            color={Colors.primary}
          />
        </View>

        {/* ACTION ROW */}
        <View className="absolute bottom-4 left-4 right-4 flex-row items-center gap-3">
          <View
            className="flex-1 bg-primary rounded-[28px] py-[14px] px-5 flex-row items-center justify-center gap-[10px]"
          >
            <Text className="text-black text-base font-[600]">
              Review details
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#000" />
          </View>
        </View>
      </View>
    </InteractivePressable>
  );
});

BookingItem.displayName = 'BookingItem';