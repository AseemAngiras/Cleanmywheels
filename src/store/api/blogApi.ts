import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL, APP_VERSION } from "./authApi";

export const blogApi = createApi({
  reducerPath: "blogApi",
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
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    getBlogs: builder.query<{ blogs: any[]; count: number }, { search?: string; page?: number; perPage?: number; category?: string; status?: string }>({
      query: (params) => ({
        url: "/blog",
        params,
      }),
      providesTags: ["Blog"],
      transformResponse: (response: any) => response.data,
    }),
    getBlogById: builder.query<any, string>({
      query: (id) => `/blog/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
      transformResponse: (response: any) => response.data,
    }),
    createBlog: builder.mutation<any, any>({
      query: (body) => ({
        url: "/blog",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/blog/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Blog", { type: "Blog", id }],
    }),
    deleteBlog: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
