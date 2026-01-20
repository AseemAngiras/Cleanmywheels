import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { RootState } from "../index";
import { API_BASE_URL, APP_VERSION } from "./authApi";

export interface Notification {
  _id: string;
  sender: string;
  receiver: string;
  title: string;
  message: string;
  type: "Info" | "Alert" | "Reminder" | "System" | "Document upload" | "Document Status Update";
  isSeen: boolean;
  metadata?: {
    bookingId?: string;
    vehicleNo?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    unSeenCount: number;
    count: number;
    notifications: Notification[];
  };
  message: string;
}

export interface GetNotificationsParams {
  page: number;
  perPage: number;
  sort?: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", token);
        headers.set("x-auth-token", token);
      }
      headers.set("Content-Type", "application/json");
      headers.set("x-platform", Platform.OS);
      headers.set("x-version", APP_VERSION);
      return headers;
    },
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, GetNotificationsParams>({
      query: ({ page, perPage, sort }) => {
        let url = `/notification?page=${page}&perPage=${perPage}`;
        if (sort) {
          url += `&sort=${encodeURIComponent(sort)}`;
        }
        return url;
      },
      providesTags: ["Notification"],
    }),
    
    getUnseenCount: builder.query<number, void>({
      query: () => `/notification?page=1&perPage=1`,
      transformResponse: (response: NotificationResponse) => response.data.unSeenCount,
      providesTags: ["Notification"],
    }),
  }),
});

export const { 
  useGetNotificationsQuery, 
  useGetUnseenCountQuery,
  useLazyGetNotificationsQuery 
} = notificationApi;
