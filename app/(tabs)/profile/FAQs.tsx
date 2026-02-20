import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQS = [
    {
      question: "How do I book a car wash?",
      answer:
        "Simply go to the 'Book Service' tab, select your location, vehicle type, and preferred service package. Choose a time slot and confirm your booking.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Razorpay for all secure online payments. Support for UPI Apps (Google Pay, PhonePe), Credit/Debit Cards, and Wallets is coming soon.",
    },
    {
      question: "Is the car wash waterless?",
      answer:
        "We offer both water-based and eco-friendly waterless wash options depending on the service package you choose. Check service details for more info.",
    },
    {
      question: "What happens if it rains?",
      answer:
        "If it rains during or immediately before your scheduled slot, we will contact you to reschedule your service free of charge.",
    },
  ];

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] text-text">FAQs</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-base text-textSecondary mb-8 text-center px-4">
            Find answers to common questions about our services and booking
            process.
          </Text>

          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => toggleAccordion(index)}
                className={`bg-card rounded-[24px] p-5 mb-4 border ${
                  isOpen ? "border-primary" : "border-border"
                } shadow-sm`}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-[600] text-text flex-1 pr-4">
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={isOpen ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                {isOpen && (
                  <View className="mt-4 pt-4 border-t border-border/50">
                    <Text className="text-[14px] text-textSecondary leading-6">
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Contact Support Section */}
          <View className="mt-6 mb-10 p-6 bg-card rounded-[32px] border border-border items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name="chatbubbles-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
            <Text className="text-[18px] font-[700] text-text mb-2">
              Still have questions?
            </Text>
            <Text className="text-[14px] text-textSecondary text-center mb-6 px-4">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help you 24/7.
            </Text>
            <TouchableOpacity
              className="bg-primary w-full py-4 rounded-2xl items-center shadow-lg shadow-primary"
              // onPress={() => router.push("/profile/contact-support")}
            >
              <Text className="text-black font-[700] text-[16px]">
                Chat with Support
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
