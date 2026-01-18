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

    getMySubscription: builder.query<UserSubscription[], void>({
      query: () => "/my-subscription",
      transformResponse: (response: { data: UserSubscription[] }) =>
        response.data,
      providesTags: ["Subscription"],
    }),

    getAllSubscriptions: builder.query<
      { subscriptions: UserSubscription[]; total: number; page: number },
      { page: number; perPage: number; status?: string }
    >({
      query: (params) => ({
        url: "/admin/all",
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
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
        vehicleId: string;
        timeSlot: string;
        startDate: string;
      }
    >({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    assignSubscriptionWorker: builder.mutation<
      any,
      { subscriptionId: string; workerId: string }
    >({
      query: (body) => ({
        url: "/assignment",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    markSubscriptionDailyDone: builder.mutation<
      any,
      { subscriptionId: string }
    >({
      query: (body) => ({
        url: "/mark-daily-done",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    getAddons: builder.query<any[], void>({
      query: () => "/addons",
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    createAddonOrder: builder.mutation<
      { paymentLinkUrl: string; subscriptionId: string; referenceId: string },
      {
        amount: number;
        subscriptionId: string;
        addons: any[];
        serviceDate: string;
      }
    >({
      query: (body) => ({
        url: "/addons/create-order",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),

    verifyAddonPayment: builder.mutation<
      any,
      {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_payment_link_id?: string;
        razorpay_payment_link_status?: string;
        razorpay_signature: string;
        subscriptionId: string;
        addons: any[];
      }
    >({
      query: (body) => ({
        url: "/addons/verify",
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
  useAssignSubscriptionWorkerMutation,
  useMarkSubscriptionDailyDoneMutation,
  useGetAddonsQuery,
  useCreateAddonOrderMutation,
  useVerifyAddonPaymentMutation,
  useGetAllSubscriptionsQuery,
} = subscriptionApi;
