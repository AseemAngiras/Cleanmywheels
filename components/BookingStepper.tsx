import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface Step {
  id: number;
  label: string;
}

interface BookingStepperProps {
  currentStep: number;
  steps?: Step[];
}

export default function BookingStepper({
  currentStep,
  steps = [
    { id: 1, label: "Service" },
    { id: 2, label: "Shop" },
    { id: 3, label: "Payment" },
  ],
}: BookingStepperProps) {
  return (
    <View className="px-5 pb-4 bg-background">
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Line connecting steps */}
              {index > 0 && (
                <View
                  className={`flex-1 h-[1.5px] mx-2 mb-4 ${
                    currentStep >= step.id ? "bg-primary" : "bg-border/50"
                  }`}
                />
              )}

              {/* Step Circle */}
              <View className="items-center">
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center border-2 mb-1.5 ${
                    isActive
                      ? "bg-primary border-primary"
                      : isCompleted
                        ? "bg-primary/20 border-primary"
                        : "bg-card border-border"
                  }`}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#000" />
                  ) : (
                    <Text
                      className={`text-[12px] font-bold ${
                        isActive
                          ? "text-black"
                          : isFuture
                            ? "text-textSecondary"
                            : "text-text"
                      }`}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  className={`text-[10px] font-bold tracking-tight uppercase ${
                    isActive
                      ? "text-text"
                      : isCompleted
                        ? "text-primary"
                        : "text-textSecondary"
                  }`}
                >
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
