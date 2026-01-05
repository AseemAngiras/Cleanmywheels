import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL, APP_VERSION } from "./authApi";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  tagTypes: ["Vehicle"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");

      const state = getState() as any;
      const token = state.auth?.token;
      
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
    getVehicles: builder.query<any, void>({
      query: () => "/vehicle",
      providesTags: ["Vehicle"],
    }),
    createVehicle: builder.mutation<any, any>({
      query: (body) => ({
        url: "/vehicle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
  }),
});

export const { useGetVehiclesQuery, useCreateVehicleMutation } = vehicleApi;
