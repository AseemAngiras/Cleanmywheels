import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL, APP_VERSION } from "./authApi";
import { SubscriptionPlan, UserSubscription } from "@/types/subscription";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/subscription`,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      const state = getState() as any;
      const token = state.auth?.token;
      if (token) {
        headers.set("Authorization", token);
        headers.set("x-auth-token", token);
      }

      // Required System Headers
      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");
      headers.set("x-version", APP_VERSION || "1.0.0");
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      return headers;
    },
  }),
  tagTypes: ["Subscription", "Plans"],
  endpoints: (builder) => ({
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/plans",
      transformResponse: (response: { data: SubscriptionPlan[] }) =>
        response.data,
      providesTags: ["Plans"],
    }),

    getMySubscription: builder.query<UserSubscription | null, void>({
      query: () => "/my-subscription",
      transformResponse: (response: { data: UserSubscription | null }) =>
        response.data,
      providesTags: ["Subscription"],
    }),

    createSubscription: builder.mutation<
      { id: string; amount: number; currency: string; planId: string },
      { planId: string }
    >({
      query: (body) => ({
        url: "/subscribe",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),

    verifySubscription: builder.mutation<
      { success: boolean; message: string },
      {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
        planId: string;
      }
    >({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useCreateSubscriptionMutation,
  useVerifySubscriptionMutation,
} = subscriptionApi;
