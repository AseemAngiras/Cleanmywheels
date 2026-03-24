import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-[18px] font-[700] text-primary mb-3">{title}</Text>
      {children}
    </View>
  );

  const SubSection = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => (
    <View className="mb-4 ml-2">
      <Text className="text-[16px] font-[600] text-text mb-1">{title}</Text>
      <Text className="text-[14px] text-textSecondary leading-5">
        {content}
      </Text>
    </View>
  );

  const BulletPoint = ({ text }: { text: string }) => (
    <View className="flex-row mb-2 ml-4">
      <View className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
      <Text className="text-[14px] text-textSecondary flex-1 leading-5">
        {text}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper
      style={{ flex: 1 }}
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-5 mb-5 mt-[10px]">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] text-text">
            Privacy Policy
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8 items-center">
            <Text className="text-[24px] font-[800] text-text text-center mb-2">
              Privacy Policy for CleanMyWheels
            </Text>
          </View>

          <Text className="text-[15px] text-textSecondary mb-8 leading-6">
            CleanMyWheels operates a car washing service application designed to
            provide convenient vehicle cleaning services to users. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Text>

          <Section title="1. Information We Collect">
            <SubSection
              title="a. Personal Information"
              content="We collect basic personal details provided during registration."
            />
            <BulletPoint text="Name" />
            <BulletPoint text="Mobile phone number" />

            <SubSection
              title="b. Location Data"
              content="Precise or approximate location to provide car washing services at your location."
            />
          </Section>

          <Section title="2. How We Use Your Information">
            <BulletPoint text="Create and manage user accounts" />
            <BulletPoint text="Verify users via OTP authentication" />
            <BulletPoint text="Schedule and deliver car washing services" />
            <BulletPoint text="Commate service updates and notifications" />
            <BulletPoint text="Improve app functionality and user experience" />
          </Section>

          <Section title="3. Authentication">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              Users log in using their mobile number and OTP (One-Time
              Password). We do not use or store passwords.
            </Text>
          </Section>

          <Section title="4. Payments">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              We use third-party payment processors such as Razorpay to process
              payments securely. We do not store your payment details on our
              servers.
            </Text>
          </Section>

          <Section title="5. Third-Party Services">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2 mb-3">
              We may use third-party services including:
            </Text>
            <BulletPoint text="Razorpay (for payments)" />
            <BulletPoint text="WhatsApp (for service-related notifications)" />
            <Text className="text-[14px] text-textSecondary leading-5 ml-2 mt-2">
              These third parties may collect and process your data according to
              their own privacy policies.
            </Text>
          </Section>

          <Section title="6. Data Sharing">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2 mb-3">
              We do not sell your personal data. We may share your data only:
            </Text>
            <BulletPoint text="With service personnel to fulfill your booking" />
            <BulletPoint text="If required by law or legal process" />
          </Section>

          <Section title="7. Data Retention">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              We retain your information only as long as necessary to provide
              services and comply with legal obligations.
            </Text>
          </Section>

          <Section title="8. Data Security">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              We implement reasonable security measures to protect your data.
              However, no method of transmission over the internet is 100%
              secure.
            </Text>
          </Section>

          <Section title="9. Children's Privacy">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              Our app is not intended for children under the age of 13. We do
              not knowingly collect data from children.
            </Text>
          </Section>

          <Section title="10. Your Rights">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2 mb-2">
              You may:
            </Text>
            <BulletPoint text="Request access to your data" />
            <BulletPoint text="Request correction or deletion of your data" />
          </Section>

          <Section title="11. Changes to This Privacy Policy">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              We may update this Privacy Policy from time to time. Changes will
              be reflected with an updated "Effective Date".
            </Text>
          </Section>

          <Section title="12. Contact Us">
            <Text className="text-[14px] text-textSecondary leading-5 ml-2">
              If you have any questions about this Privacy Policy, you can
              contact us at:
            </Text>
            <TouchableOpacity className="mt-3 ml-2 bg-card p-3 rounded-xl border border-border">
              <Text className="text-primary font-[600]">
                support@cleanmywheels.com
              </Text>
            </TouchableOpacity>
          </Section>

          <View className="mt-8 pt-8 pb-20 border-t border-border items-center">
            <Text className="text-[13px] text-textSecondary text-center italic">
              By using CleanMyWheels, you agree to this Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
