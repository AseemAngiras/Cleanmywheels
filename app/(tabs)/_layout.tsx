import { Tabs, useSegments } from "expo-router";
import { CustomTabBar } from "../../components/CustomTabBar";

export default function TabsLayout() {
  const segments = useSegments();

  // Check if we are in a sub-flow that should hide tabs
  const segmentString = JSON.stringify(segments);
  const hideTabs = segmentString.includes('book-service') || segmentString.includes('book-doorstep');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabs ? { display: 'none' } : undefined
      }}
      tabBar={(props) => (
        hideTabs ? null : <CustomTabBar {...props} />
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="my-cars" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
