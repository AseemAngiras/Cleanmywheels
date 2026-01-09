import { RootState } from "@/store";
import { Tabs, useSegments } from "expo-router";
import { useSelector } from "react-redux";
import { CustomTabBar } from "../../components/CustomTabBar";
import { ShopTabBar } from "../../components/ShopTabBar";

export default function TabsLayout() {
  const segments = useSegments();

  // Check if we are in a sub-flow that should hide tabs
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === 'Super Admin';

  const segmentString = JSON.stringify(segments);
  const hideTabs = segmentString.includes('book-service') || segmentString.includes('book-doorstep') || !isLoggedIn;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabs ? { display: 'none' } : undefined
      }}
      tabBar={(props) => (
        hideTabs ? null : isAdmin ? <ShopTabBar {...props} /> : <CustomTabBar {...props} />
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="my-cars"
        options={{
          title: 'My Cars',
        }}
      />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
