import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { useGetBlogsQuery, useCreateBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation } from '@/store/api/blogApi';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { InteractivePressable } from '@/components/ui/InteractivePressable';
import { toast } from '@/utils/toast';
import { useAlert } from '@/providers/AlertProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminBlogsScreen() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                router.replace("/dashboard");
                return true;
            };

            const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isFetching } = useGetBlogsQuery({ page, perPage: 20, status: 'all' });
    const blogs = data?.blogs || [];

    const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
    const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
    const [deleteBlog] = useDeleteBlogMutation();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Blog',
        image: '',
        status: 'published'
    });

    const handleOpenModal = (blog: any = null) => {
        if (blog) {
            setEditingBlog(blog);
            setFormData({
                title: blog.title,
                content: blog.content,
                category: blog.category,
                image: blog.image || '',
                status: blog.status
            });
        } else {
            setEditingBlog(null);
            setFormData({
                title: '',
                content: '',
                category: 'Blog',
                image: '',
                status: 'published'
            });
        }
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) {
            return toast.error("Error", "Title and content are required");
        }

        try {
            if (editingBlog) {
                await updateBlog({ id: editingBlog._id, body: formData }).unwrap();
                toast.success("Success", "Blog updated successfully");
            } else {
                await createBlog(formData).unwrap();
                toast.success("Success", "Blog created successfully");
            }
            setModalVisible(false);
            refetch();
        } catch (error: any) {
            toast.error("Error", error?.data?.message || "Something went wrong");
        }
    };

    const handleDelete = (id: string) => {
        showAlert({
            title: "Delete Blog",
            message: "Are you sure you want to delete this blog? This action cannot be undone.",
            type: "error",
            buttons: [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deleteBlog(id).unwrap();
                            toast.success("Success", "Blog deleted successfully");
                            refetch();
                        } catch (error: any) {
                            toast.error("Error", error?.data?.message || "Failed to delete");
                        }
                    }
                }
            ]
        });
    };

    const renderBlogItem = ({ item }: { item: any }) => (
        <View className="mb-4 mx-5 p-4 rounded-[24px] bg-card border border-border">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-0.5 rounded-full ${item.category === 'Update' ? 'bg-primary/20' : 'bg-blue-500/20'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${item.category === 'Update' ? 'text-primary' : 'text-blue-400'}`}>
                                {item.category}
                            </Text>
                        </View>
                        <Text className="text-textSecondary text-[10px] ml-2 font-bold uppercase">
                            {item.status}
                        </Text>
                        <Text className="text-textSecondary text-[10px] ml-auto font-bold uppercase">
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text className="text-text text-[16px] font-bold mb-1" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-textSecondary text-[12px]" numberOfLines={2}>{item.content}</Text>
                </View>
                <View className="flex-row gap-2 ml-4">
                    <TouchableOpacity onPress={() => handleOpenModal(item)} className="p-2 rounded-full bg-background border border-border">
                        <Ionicons name="pencil" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} className="p-2 rounded-full bg-background border border-border">
                        <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <ScreenWrapper backgroundColor={Colors.background}>
            <View className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-card border-b border-border/50">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.replace("/profile")}
                            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                        >
                            <Ionicons name="arrow-back" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        <Text className="text-[18px] font-[800] color-text ml-4">Manage Blogs</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => handleOpenModal()}
                        className="bg-primary px-4 py-2 rounded-full flex-row items-center"
                    >
                        <Ionicons name="add" size={20} color="black" />
                        <Text className="text-black font-bold ml-1">New</Text>
                    </TouchableOpacity>
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
                                <Text className="text-textSecondary">No blogs found.</Text>
                            </View>
                        }
                    />
                )}

                {/* Create/Edit Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1 bg-black/60 justify-end"
                    >
                        <View className="bg-card rounded-t-[32px] p-6 border-t border-border max-h-[90%]">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-xl font-bold text-text">{editingBlog ? 'Edit Blog' : 'Create New Blog'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={Colors.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="mb-4">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-textSecondary font-bold uppercase text-[10px]">Title</Text>
                                        <Text className="text-textSecondary font-bold text-[10px]">{formData.title.length}/100</Text>
                                    </View>
                                    <TextInput 
                                        className="bg-background p-4 rounded-2xl border border-border color-text"
                                        placeholder="Enter blog title"
                                        placeholderTextColor="#555"
                                        maxLength={100}
                                        value={formData.title}
                                        onChangeText={(text) => setFormData({...formData, title: text})}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-textSecondary mb-2 font-bold uppercase text-[10px]">Content</Text>
                                    <TextInput 
                                        className="bg-background p-4 rounded-2xl border border-border color-text"
                                        placeholder="Enter content details here..."
                                        placeholderTextColor="#555"
                                        multiline
                                        numberOfLines={12}
                                        style={{ minHeight: 200 }}
                                        textAlignVertical="top"
                                        value={formData.content}
                                        onChangeText={(text) => setFormData({...formData, content: text})}
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-textSecondary mb-2 font-bold uppercase text-[10px]">Image URL (Optional)</Text>
                                    <TextInput 
                                        className="bg-background p-4 rounded-2xl border border-border color-text"
                                        placeholder="https://example.com/image.jpg"
                                        placeholderTextColor="#555"
                                        value={formData.image}
                                        onChangeText={(text) => setFormData({...formData, image: text})}
                                    />
                                </View>

                                <View className="flex-row gap-4 mb-6">
                                    <View className="flex-1">
                                        <Text className="text-textSecondary mb-2 font-bold uppercase text-[10px]">Category</Text>
                                        <View className="flex-row gap-2">
                                            {['Blog', 'Update'].map(cat => (
                                                <TouchableOpacity 
                                                    key={cat}
                                                    onPress={() => setFormData({...formData, category: cat as any})}
                                                    className={`flex-1 p-3 rounded-xl border items-center ${formData.category === cat ? 'bg-primary border-primary' : 'bg-background border-border'}`}
                                                >
                                                    <Text className={`font-bold ${formData.category === cat ? 'text-black' : 'text-textSecondary'}`}>{cat}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    onPress={handleSubmit}
                                    disabled={isCreating || isUpdating}
                                    className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary"
                                    style={{ marginBottom: Math.max(insets.bottom, 20) }}
                                >
                                    {isCreating || isUpdating ? (
                                        <ActivityIndicator color="black" />
                                    ) : (
                                        <Text className="text-black font-bold text-lg">{editingBlog ? 'Update Blog' : 'Publish Blog'}</Text>
                                    )}
                                </TouchableOpacity>
                                <View style={{ height: 268 }} />
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </ScreenWrapper>
    );
}
