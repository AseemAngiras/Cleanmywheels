import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQPage() {
  const navigation = useNavigation();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>

        <Text style={styles.title}>Frequently Asked Questions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Here are some common questions to help you out.
        </Text>

        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Pressable
              key={index}
              style={[styles.card, isOpen && styles.cardOpen]}
              onPress={() => toggleAccordion(index)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>
              {isOpen && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{faq.answer}</Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Contact Support Section */}
        <Pressable
          style={[
            styles.card,
            openIndex === -1 && styles.cardOpen,
            { marginTop: 12 },
          ]}
          onPress={() => toggleAccordion(-1)}
        >
          <View style={styles.cardHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={styles.question}>Still have questions?</Text>
            </View>
          </View>
          {openIndex === -1 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answer}>
                Can&apos;t find the answer you&apos;re looking for? Please chat
                to our friendly team.
              </Text>
              <Pressable style={styles.chatBtn}>
                <Text style={styles.chatBtnText}>Chat with Support</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F3F4F7",
  },
  backBtn: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  cardOpen: {
    borderColor: "#84c95c",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    paddingRight: 10,
  },
  answerContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F7",
    paddingTop: 12,
  },
  answer: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  chatBtn: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    alignSelf: "flex-start",
  },
  chatBtnText: {
    color: "#D1F803",
    fontWeight: "600",
    fontSize: 14,
  },
});
