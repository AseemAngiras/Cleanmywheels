import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AdminBookingsScreen from "@/components/admin/AdminBookingsScreen";

export default function BookingsIndex() {
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  if (isAdmin) {
    return <AdminBookingsScreen />;
  }

  return <Redirect href="/bookings/upcoming-services" />;
}
