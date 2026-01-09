import { RootState } from "@/store";
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
    const user = useSelector((state: RootState) => state.user.user);
    const isAdmin = user?.accountType === 'Super Admin';

    if (isAdmin) {
        return <Redirect href={"/(tabs)/dashboard"} />
    }

    return <Redirect href={"/home"} />
}
