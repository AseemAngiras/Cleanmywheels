import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import Constants from "expo-constants";

const MY_PC_IP = "10.94.180.228";

const API_BASE_URL = __DEV__
  ? `http://${MY_PC_IP}:3000/api`
  : "https://your-production-api.com/api";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");

      // x-platform
      if (Platform.OS === "android") {
        headers.set("x-platform", "android");
      } else if (Platform.OS === "ios") {
        headers.set("x-platform", "ios");
      } else {
        headers.set("x-platform", "web");
      }

      // x-version
      headers.set("x-version", APP_VERSION);

      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      console.log("🌍 API Headers Sent:", {
        "x-platform":
          Platform.OS === "android"
            ? "android"
            : Platform.OS === "ios"
            ? "ios"
            : "web",
        "x-version": APP_VERSION,
        "x-time-zone": TIMEZONE,
      });

      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    requestOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/request-otp",
        method: "POST",
        body,
      }),
    }),
    verifyLoginOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/log-in",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
} = authApi;
