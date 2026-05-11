import { Booking } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { logout } from "../slices/authSlice";
import { API_BASE_URL, APP_VERSION } from "./authApi";

export interface BookingsResponse {
  success: boolean;
  data: {
    count: number;
    bookingList: Booking[];
  };
}

export const bookingApi = createApi({
  reducerPath: "bookingApi",
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
  tagTypes: ["Booking", "Worker"],
  endpoints: (builder) => ({
    getBookings: builder.query<
      BookingsResponse,
      { page?: number; perPage?: number } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const perPage = params?.perPage ?? 10;
        return `/booking?page=${page}&perPage=${perPage}`;
      },
      providesTags: ["Booking"],
    }),
    createBooking: builder.mutation<any, any>({
      query: (body: {
        washPackage: string;
        vehicle: string;
        address: string;
        bookingDate: string;
        timeSlot: string;
        addons?: string[];
      }) => ({
        url: "/booking",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          if (error.error?.status === 401) {
            console.error(" [BookingApi] 401 Unauthorized - Logging out");
            dispatch(logout());
          }
        }
      },
    }),
    getBookingById: builder.query<any, string>({
      query: (id) => `/booking/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    updateBookingStatus: builder.mutation<
      any,
      {
        id: string;
        status?: string;
        worker?: string;
        workerName?: string;
        workerPhone?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/booking/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Booking", id },
        "Booking",
        "Worker",
      ],
    }),
    assignWorkerAndNotify: builder.mutation<
      any,
      {
        bookingId: string;
        workerId: string;
      }
    >({
      query: (body) => ({
        url: `/booking/assign-notify`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking", "Worker"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useGetBookingByIdQuery,
  useLazyGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useAssignWorkerAndNotifyMutation,
} = bookingApi;
