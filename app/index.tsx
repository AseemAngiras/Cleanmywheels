import { RootState } from "@/store";
import { Redirect } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";

export default function Index() {
    const userPhone = useSelector((state: RootState) => state.user.phone);
    const sanitizedPhone = userPhone ? userPhone.replace(/\D/g, '') : '';
    const isAdmin = sanitizedPhone.endsWith('1234567890');

    if (isAdmin) {
        return <Redirect href={"/(tabs)/dashboard"} />
    }

    return <Redirect href={"/home"} />
}
