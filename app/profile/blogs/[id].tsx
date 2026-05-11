import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetBlogByIdQuery } from '@/store/api/blogApi';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function BlogDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: blog, isLoading } = useGetBlogByIdQuery(id as string);

    if (isLoading) {
        return (
            <ScreenWrapper backgroundColor={Colors.background}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!blog) {
        return (
            <ScreenWrapper backgroundColor={Colors.background}>
                <View className="flex-1 items-center justify-center p-5">
                    <Text className="text-text font-bold text-xl">Blog not found</Text>
                    <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-full">
                        <Text className="font-bold text-black">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper backgroundColor={Colors.background}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Image / Header Overlay */}
                <View className="relative">
                    {blog.image ? (
                        <Image 
                            source={{ uri: blog.image }} 
                            className="w-full h-80"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-40 bg-card" />
                    )}
                    
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/20"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeIn.duration(600)} className="px-5 -mt-8 bg-background rounded-t-[40px] pt-8 pb-20">
                    <View className="flex-row items-center mb-4">
                        <View className={`px-3 py-1 rounded-full ${blog.category === 'Update' ? 'bg-primary/20' : 'bg-blue-500/20'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${blog.category === 'Update' ? 'text-primary' : 'text-blue-400'}`}>
                                {blog.category}
                            </Text>
                        </View>
                        <Text className="text-textSecondary text-[13px] ml-4 font-medium">
                            {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>

                    <Text className="text-text text-[28px] font-[900] mb-6 leading-[36px] tracking-tight">
                        {blog.title}
                    </Text>

                    <View className="w-full h-[1px] bg-border mb-8" />

                    <Text className="text-text/90 text-[16px] leading-[28px] font-normal text-justify">
                        {blog.content}
                    </Text>

                    {/* Footer branding */}
                    <View className="mt-12 p-6 rounded-[24px] bg-card border border-border items-center">
                        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-3">
                            <Ionicons name="sparkles" size={24} color={Colors.primary} />
                        </View>
                        <Text className="text-text font-bold text-center">CleanMyWheels Updates</Text>
                        <Text className="text-textSecondary text-center text-[12px] mt-1">Bringing the best car care directly to you.</Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </ScreenWrapper>
    );
}
