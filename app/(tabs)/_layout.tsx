import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#84c95c",
                tabBarInactiveTintColor: "#999",
                tabBarStyle: {
                    height: 80,
                    position: 'absolute',
                    bottom: 2,
                    left: 20,
                    right: 20,
                    elevation: 5,
                    backgroundColor: '#ffffff',
                    borderRadius: 25,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    borderTopWidth: 0,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
                    )
                }}
            />
            <Tabs.Screen
                name="my-cars"
                options={{
                    title: "My Cars",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "car" : "car-outline"} color={color} size={size} />
                    )
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: "Bookings",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "receipt" : "receipt-outline"} color={color} size={size} />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "person-circle" : "person-circle-outline"} color={color} size={size} />
                    )
                }}
            />

        </Tabs>
    )
}