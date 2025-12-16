import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen 
            name="home"
            options={{
                title: "Home",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="home-outline" color={color} size={size}/>
                )
            }}
            />
            <Tabs.Screen 
            name="my-cars"
            options={{
                title: "My cars",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="car-outline" color={color} size={size}/>
                )
            }}
            />
            <Tabs.Screen 
            name="bookings"
            options={{
                title: "Bookings",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="book-outline" color={color} size={size}/>
                )
            }}
            />
            <Tabs.Screen 
            name="profile"
            options={{
                title: "Profile",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="person-outline" color={color} size={size}/>
                )
            }}
            />
         
        </Tabs>
    )
}