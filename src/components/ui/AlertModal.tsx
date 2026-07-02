import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  type?: "info" | "success" | "error" | "warning";
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttons,
  type = "info",
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#22C55E" };
      case "error":
        return { name: "alert-circle", color: "#EF4444" };
      case "warning":
        return { name: "warning", color: "#F59E0B" };
      default:
        return { name: "information-circle", color: Colors.primary };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.8)" }]} />
          
          <TouchableWithoutFeedback>
            <View className="w-[85%] bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl">
              <View className="p-8 items-center">
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-6"
                  style={{ backgroundColor: `${icon.color}15` }}
                >
                  <Ionicons name={icon.name as any} size={32} color={icon.color} />
                </View>
                
                <Text className="text-[22px] font-[800] color-text text-center mb-2 tracking-tight">
                  {title}
                </Text>
                
                <Text className="text-[15px] color-textSecondary text-center font-[500] leading-6 px-2">
                  {message}
                </Text>
              </View>

              <View className="flex-row border-t border-border/50">
                {buttons.map((button, index) => {
                  const isDestructive = button.style === "destructive";
                  const isCancel = button.style === "cancel";
                  const isLast = index === buttons.length - 1;

                  return (
                    <TouchableOpacity
                      key={index}
                      className={`flex-1 h-14 items-center justify-center ${!isLast ? "border-r border-border/50" : ""}`}
                      onPress={() => {
                        onClose();
                        if (button.onPress) button.onPress();
                      }}
                    >
                      <Text
                        className={`text-[15px] font-[700] ${
                          isDestructive
                            ? "text-red-500"
                            : isCancel
                              ? "color-textSecondary"
                              : "color-primary"
                        }`}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
