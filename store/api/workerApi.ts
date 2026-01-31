import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { RootState } from "..";

export interface Worker {
  _id: string;
  name: string;
  phone: string;
  countryCode: string;
  formattedPhone: string;
  status: "Active" | "Inactive" | "On Leave" | "Busy";
  jobRole: string;
  address: string;
  joiningDate: string;
  profileImage: string;
}

export const workerApi = createApi({
  reducerPath: "workerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL + "/worker",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token && token !== "dummy-token") {
        headers.set("authorization", `Bearer ${token}`);
      }

      const appVersion = Constants.expoConfig?.version ?? "1.0.0";
      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");
      headers.set("x-version", appVersion);
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      return headers;
    },
  }),
  tagTypes: ["Worker"],
  endpoints: (builder) => ({
    getWorkers: builder.query<
      { workers: Worker[]; total: number },
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: "/",
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ["Worker"],
    }),
    getWorkerById: builder.query<Worker, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: { data: Worker }) => response.data,
      providesTags: (result, error, id) => [{ type: "Worker", id }],
    }),
    createWorker: builder.mutation<Worker, Partial<Worker>>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: Worker }) => response.data,
      invalidatesTags: ["Worker"],
    }),
    updateWorker: builder.mutation<
      Worker,
      { id: string; data: Partial<Worker> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: Worker }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        "Worker",
        { type: "Worker", id },
      ],
    }),
    deleteWorker: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ["Worker"],
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useGetWorkerByIdQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
} = workerApi;
