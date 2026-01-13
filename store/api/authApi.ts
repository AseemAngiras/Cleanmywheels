import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const MY_PC_IP = "192.168.1.6";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL
  : __DEV__
  ? `http://${MY_PC_IP}:5000/api`
  : "https://your-production-api.com/api";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");

      const state = getState() as any;
      const token = state.auth?.token;

      headers.set("Accept", "application/json");
      if (token) {
        headers.set("Authorization", `${token}`);
        headers.set("x-auth-token", `${token}`);
      }

      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");
      headers.set("x-version", APP_VERSION || "1.0.0");
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

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
    verifyRegisterOtp: builder.mutation({
      query: ({ body, token }) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
        headers: token
          ? { Authorization: token, "x-auth-token": token }
          : undefined,
      }),
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/auth/update-profile",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
  useUpdateProfileMutation,
} = authApi;
