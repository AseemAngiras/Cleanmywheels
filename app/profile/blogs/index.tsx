import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useGetBlogsQuery } from '@/store/api/blogApi';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { InteractivePressable } from '@/components/ui/InteractivePressable';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function BlogsScreen() {
    const router = useRouter();
    const { data, isLoading, refetch, isFetching } = useGetBlogsQuery({ status: 'published' });
    const blogs = data?.blogs || [];

    const renderBlogItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View 
            entering={FadeInUp.delay(index * 100).duration(500)}
            className="mb-5 mx-5 rounded-[24px] bg-card border border-border overflow-hidden"
        >
            <InteractivePressable 
                onPress={() => router.push({
                    pathname: "/profile/blogs/[id]",
                    params: { id: item._id }
                })}
            >
                {item.image && (
                    <Image 
                        source={{ uri: item.image }} 
                        className="w-full h-48"
                        resizeMode="cover"
                    />
                )}
                <View className="p-5">
                    <View className="flex-row items-center mb-2">
                        <View className={`px-3 py-1 rounded-full ${item.category === 'Update' ? 'bg-primary/20' : 'bg-blue-500/20'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${item.category === 'Update' ? 'text-primary' : 'text-blue-400'}`}>
                                {item.category}
                            </Text>
                        </View>
                        <Text className="text-textSecondary text-[12px] ml-3 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                    <Text className="text-text text-[18px] font-bold mb-2 leading-6">
                        {item.title}
                    </Text>
                    <Text className="text-textSecondary text-[14px] leading-5" numberOfLines={2}>
                        {item.content}
                    </Text>
                </View>
            </InteractivePressable>
        </Animated.View>
    );

    return (
        <ScreenWrapper backgroundColor={Colors.background}>
            <View className="flex-1 mb-10">
                {/* Header */}
                <View className="flex-row items-center px-5 pt-4 pb-4 bg-card border-b border-border/50">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                    >
                        <Ionicons name="arrow-back" size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <View className="ml-4">
                        <Text className="text-[20px] font-[700] color-text">Updates & Blogs</Text>
                        <Text className="text-[11px] color-textSecondary font-[600] uppercase tracking-widest">
                            CleanMyWheels Newsroom
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={blogs}
                        renderItem={renderBlogItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingVertical: 20 }}
                        refreshing={isFetching}
                        onRefresh={refetch}
                        ListEmptyComponent={
                            <View className="items-center py-20">
                                <Ionicons name="newspaper-outline" size={64} color={Colors.textSecondary} />
                                <Text className="text-textSecondary mt-4 font-medium text-lg">No updates yet</Text>
                                <Text className="text-textSecondary/60 mt-1">Check back later for news!</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}
