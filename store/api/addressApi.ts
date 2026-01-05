import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL, APP_VERSION } from "./authApi";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const addressApi = createApi({
  reducerPath: "addressApi",
  tagTypes: ["Address"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");

      const state = getState() as any;
      const token = state.auth?.token;
      
      console.log(" [AddressApi] PrepareHeaders - Token present:", !!token);
      if (token) {
        console.log(" [AddressApi] Adding Authorization header (Raw)");
        headers.set("Authorization", `${token}`);
        headers.set("x-auth-token", `${token}`);
      } else {
        console.warn(" [AddressApi] No token found in state.auth.token");
      }

      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");
      headers.set("x-version", APP_VERSION || "1.0.0");
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAddresses: builder.query<any, void>({
      query: () => "/address",
      providesTags: ["Address"],
    }),
    createAddress: builder.mutation<any, any>({
      query: (body) => ({
        url: "/address",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const { useGetAddressesQuery, useCreateAddressMutation, useLazyGetAddressesQuery } = addressApi;
