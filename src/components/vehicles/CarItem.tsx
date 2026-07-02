import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface CarItemProps {
  item: any;
  isExpanded: boolean;
  isSubscribed: boolean;
  onToggle: (id: string) => void;
  onEdit: (item: any) => void;
  onRemove: (id: string) => void;
}

const getVehicleIconName = (typeValue: string) => {
  switch (typeValue?.toLowerCase()) {
    case 'hatchback':
      return 'car-hatchback';
    case 'sedan':
      return 'car-side';
    case 'suv':
      return 'car-estate';
    default:
      return 'car';
  }
};

export const CarItem = React.memo(({ item, isExpanded, isSubscribed, onToggle, onEdit, onRemove }: CarItemProps) => {
  const id = item._id || item.id;

  return (
    <Pressable
      style={{
        marginBottom: 16,
        borderRadius: 28,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: Colors.card,
        borderColor: isExpanded ? Colors.primary : 'rgba(226, 232, 240, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={() => onToggle(id)}
    >
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[18px] font-[800] color-text leading-tight">{item.vehicleType}</Text>
              {isSubscribed && (
                <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  <Text className="text-[8px] font-[900] color-primary">SUBSCRIPTION</Text>
                </View>
              )}
            </View>
            <Text className="text-[12px] color-textSecondary font-[700] uppercase tracking-widest">{item.vehicleType}</Text>
          </View>
          <View className="bg-background w-12 h-12 rounded-2xl items-center justify-center">
            <MaterialCommunityIcons
              name={getVehicleIconName(item.vehicleType) as any}
              size={28}
              color={isExpanded ? Colors.primary : Colors.textSecondary}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="bg-white border-[1.5px] border-black rounded-lg overflow-hidden flex-row items-center h-10 px-3">
            <View className="bg-[#003399] -ml-3 h-full px-2 justify-center">
              <Text className="text-white text-[8px] font-[900]">IND</Text>
            </View>
            <Text className="text-black text-[16px] font-[900] tracking-[2px] ml-3">{item.vehicleNo}</Text>
          </View>
          {isExpanded ? (
            <Ionicons name="chevron-up" size={20} color={Colors.primary} />
          ) : (
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          )}
        </View>

        {isExpanded && (
          <View className="mt-6 pt-5 border-t border-border/20 flex-row gap-3">
            <Pressable
              style={{
                flex: 1,
                height: 48,
                backgroundColor: Colors.background,
                borderWidth: 1,
                borderColor: 'rgba(226, 232, 240, 0.5)',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create-outline" size={16} color={Colors.text} />
              <Text className="text-[13px] font-[700] color-text ml-2">Edit</Text>
            </Pressable>

            <Pressable
              style={{
                flex: 1,
                height: 48,
                borderWidth: 1,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSubscribed ? Colors.background : 'rgba(239, 68, 68, 0.1)',
                borderColor: isSubscribed ? 'rgba(226, 232, 240, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                opacity: isSubscribed ? 0.5 : 1,
              }}
              onPress={() => {
                if (!isSubscribed) onRemove(id);
              }}
            >
              <Ionicons name="trash-outline" size={16} color={isSubscribed ? Colors.textSecondary : Colors.error} />
              <Text className={`text-[13px] font-[700] ml-2 ${isSubscribed ? 'color-textSecondary' : 'color-error'}`}>
                Remove
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
});

CarItem.displayName = 'CarItem';
