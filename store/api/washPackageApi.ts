import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL } from "./authApi";

export interface WashPackage {
  _id: string;
  name: string;
  logo: string;
  tag: string;
  price: number;
  features: string[];
  status: string;
}

export interface WashPackagesResponse {
  success: boolean;
  data: {
    count: number;
    washPackageList: WashPackage[];
  };
}

export const washPackageApi = createApi({
  reducerPath: "washPackageApi",
  tagTypes: ["WashPackage"],
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
    getWashPackages: builder.query<WashPackagesResponse, { search?: string; page?: number; perPage?: number } | void>({
      query: (params) => ({
        url: "/wash-package",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["WashPackage"],
    }),
    getWashPackageById: builder.query<{ success: boolean; data: WashPackage }, string>({
      query: (id) => `/wash-package/${id}`,
      providesTags: (result, error, id) => [{ type: "WashPackage", id }],
    }),
    createWashPackage: builder.mutation<any, Partial<WashPackage>>({
      query: (body) => ({
        url: "/wash-package",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WashPackage"],
    }),
    updateWashPackage: builder.mutation<any, { id: string; body: Partial<WashPackage> }>({
      query: ({ id, body }) => ({
        url: `/wash-package/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WashPackage"],
    }),
  }),
});

export const { useGetWashPackagesQuery, useGetWashPackageByIdQuery, useUpdateWashPackageMutation, useCreateWashPackageMutation } = washPackageApi;
