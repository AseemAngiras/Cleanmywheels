import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { formatPrice } from "@/utils/formatPrice";

interface AddonsModalProps {
  visible: boolean;
  onClose: () => void;
  addonsList: any[];
  addons: Record<string, boolean>;
  onToggleAddon: (id: string) => void;
}

export const AddonsModal: React.FC<AddonsModalProps> = ({
  visible,
  onClose,
  addonsList,
  addons,
  onToggleAddon,
}) => {
  const insets = useSafeAreaInsets();
  const selectedCount = Object.values(addons).filter((v) => v).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/70 justify-end">
        {/* Backdrop press to close */}
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="bg-card rounded-t-[40px] p-6 max-h-[85%] border-t border-white/10"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-[900] color-text italic uppercase">
                Extra <Text className="text-primary">Care</Text>
              </Text>
              <Text className="text-xs font-[700] color-textSecondary uppercase tracking-widest">
                {selectedCount} items selected
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-background items-center justify-center border border-white/10"
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Addon List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {addonsList.map((addon: any, idx: number) => {
              const aid = addon._id || addon.id;
              const isSelected = !!addons[aid];
              return (
                <TouchableOpacity
                  key={aid || `modal-addon-${idx}`}
                  onPress={() => onToggleAddon(aid)}
                  activeOpacity={0.7}
                  className={`flex-row items-center p-5 rounded-[28px] border mb-4 ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border/50"
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                      isSelected ? "bg-primary/20" : "bg-card"
                    }`}
                  >
                    <Ionicons
                      name={isSelected ? "sparkles" : "add-circle-outline"}
                      size={24}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[15px] font-[800] color-text">
                      {addon.name}
                    </Text>
                    <Text className="text-[13px] font-[900] color-primary mt-0.5">
                      +₹{formatPrice(addon.normalPrice || addon.price)}
                    </Text>
                    {addon.description && (
                      <Text
                        className="text-[11px] color-textSecondary font-[500] mt-1"
                        numberOfLines={2}
                      >
                        {addon.description}
                      </Text>
                    )}
                  </View>

                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                      isSelected ? "bg-primary border-primary" : "border-border/50"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#000" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-primary py-4 rounded-2xl items-center"
          >
            <Text className="color-black font-[900] uppercase italic tracking-wider">
              Apply Selection
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
