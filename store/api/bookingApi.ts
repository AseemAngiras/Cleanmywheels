import { Booking } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { logout } from "../slices/authSlice";
import { API_BASE_URL, APP_VERSION } from "./authApi";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface BookingsResponse {
  success: boolean;
  data: Booking[];
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
      console.log("🛠 [BookingApi] Token found:", !!token);

      if (token) {
        headers.set("Authorization", `${token}`);
        headers.set("x-auth-token", `${token}`);
        console.log("🛠 [BookingApi] Authorization Header Set (Raw Token)");
      } else {
        console.warn("⚠️ [BookingApi] NO TOKEN - Authorization header missing!");
      }

      headers.set("x-platform", Platform.OS === "ios" ? "ios" : "android");
      headers.set("x-version", APP_VERSION || "1.0.0");
      headers.set("x-time-zone", "330");
      headers.set("Accept-Language", "en");

      return headers;
    },
  }),
  tagTypes: ["Booking"],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingsResponse, void>({
      query: () => "/booking",
      providesTags: ["Booking"],
    }),
    createBooking: builder.mutation<any, any>({
      query: (body) => ({
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
            console.error("❌ [BookingApi] 401 Unauthorized - Logging out");
            dispatch(logout());
          }
        }
      },
    }),
    getBookingById: builder.query<any, string>({
      query: (id) => `/booking/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    updateBookingStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/booking/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Booking", id }, "Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
} = bookingApi;
