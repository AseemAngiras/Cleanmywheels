import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface RequestOtpBody {
  otpType: "LOGIN";
  verifyType: "PHONE";
  countryCode: "91";
  phone: string;
}

export interface VerifyLoginOtpBody {
  countryCode: "91";
  phone: string;
  loginToken: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name?: string;
    phone: string;
    email?: string;
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://http://localhost:3000/api/auth",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    requestOtp: builder.mutation<void, RequestOtpBody>({
      query: (body) => ({
        url: "/request-otp",
        method: "POST",
        body,
      }),
    }),
    verifyLoginOtp: builder.mutation<AuthResponse, VerifyLoginOtpBody>({
      query: (body) => ({
        url: "/log-in",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRequestOtpMutation, useVerifyLoginOtpMutation } = authApi;
