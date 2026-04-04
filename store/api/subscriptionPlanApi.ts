import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL } from "./authApi";
import { SubscriptionPlan } from "@/types/subscription";

export { SubscriptionPlan };

export interface SubscriptionPlansResponse {
  success: boolean;
  data: {
    count: number;
    subscriptionPlanList: SubscriptionPlan[];
  };
}

export const subscriptionPlanApi = createApi({
  reducerPath: "subscriptionPlanApi",
  tagTypes: ["SubscriptionPlan"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");

      const state = getState() as any;
      const token = state.auth?.token;

      if (token) {
        headers.set("Authorization", `${token}`);
        headers.set("x-auth-token", token);
      }

      headers.set("x-version", "1.0.0");
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<
      SubscriptionPlansResponse,
      {
        search?: string;
        page?: number;
        perPage?: number;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/subscription-plan",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["SubscriptionPlan"],
    }),
    getSubscriptionPlanById: builder.query<
      { success: boolean; data: SubscriptionPlan },
      string
    >({
      query: (id) => `/subscription-plan/${id}`,
      providesTags: (result, error, id) => [{ type: "SubscriptionPlan", id }],
    }),
    createSubscriptionPlan: builder.mutation<any, Partial<SubscriptionPlan>>({
      query: (body) => ({
        url: "/subscription-plan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    updateSubscriptionPlan: builder.mutation<
      any,
      { id: string; body: Partial<SubscriptionPlan> }
    >({
      query: ({ id, body }) => ({
        url: `/subscription-plan/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    deleteSubscriptionPlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/subscription-plan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanByIdQuery,
  useUpdateSubscriptionPlanMutation,
  useCreateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = subscriptionPlanApi;
