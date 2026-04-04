import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL } from "./authApi";

export interface WashPackage {
  _id: string;
  name: string;
  // logo: string;
  tag: string;
  price: number;
  prices: {
    hatchback: { DAILY: number; WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; ONE_TIME: number };
    sedan: { DAILY: number; WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; ONE_TIME: number };
    suv: { DAILY: number; WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; ONE_TIME: number };
    twoWheeler: { DAILY: number; WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; ONE_TIME: number };
  };
  features: string[];
  status: string;
  packageType: "ONE_TIME" | "SUBSCRIPTION";
  description?: string;
  durationDays?: number;
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
    getWashPackages: builder.query<
      WashPackagesResponse,
      {
        search?: string;
        page?: number;
        perPage?: number;
        packageType?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/wash-package",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["WashPackage"],
    }),
    getWashPackageById: builder.query<
      { success: boolean; data: WashPackage },
      string
    >({
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
    updateWashPackage: builder.mutation<
      any,
      { id: string; body: Partial<WashPackage> }
    >({
      query: ({ id, body }) => ({
        url: `/wash-package/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WashPackage"],
    }),
    deleteWashPackage: builder.mutation<any, string>({
      query: (id) => ({
        url: `/wash-package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WashPackage"],
    }),
  }),
});

export const {
  useGetWashPackagesQuery,
  useGetWashPackageByIdQuery,
  useUpdateWashPackageMutation,
  useCreateWashPackageMutation,
  useDeleteWashPackageMutation,
} = washPackageApi;
