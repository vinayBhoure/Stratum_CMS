/**
 * PUBLIC API — RTK Query slice (Phase 4 handoff, not yet wired into the store)
 *
 * Base URL: /v1/:userId/:section
 * Auth: none — open to all origins
 * Cache tag: PublicUser (read-only; no mutations here)
 *
 * To integrate:
 *   1. Create client/src/redux/api/baseApi.ts with fetchBaseQuery pointing to
 *      your /v1 origin and NO credentials flag.
 *   2. Add publicApi.reducer to the Redux store.
 *   3. Add publicApi.middleware to the store middleware chain.
 *   4. Import hooks into your portfolio consumer components.
 *
 * Note: this slice intentionally omits `credentials: 'include'` — the public
 * API is open-CORS and does not use cookies.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// Types — mirrored from api_contracts.md §12
// ---------------------------------------------------------------------------

export interface PublicUserInfo {
  name: string;
  email: string | null;
  contactNumber: { countryCode: string; number: string } | null;
  address: string | null;
  googleLocationLink: string | null;
  socialMediaLinks: Record<string, string> | null;
}

export interface PublicProject {
  title: string;
  description: string | null;
  mediaUrl: string | null;
  githubLink: string | null;
  liveLink: string | null;
  skills: string[];
  tags: string[];
}

export interface PublicExperienceCertificate {
  name: string;
  url: string;
}

export interface PublicExperience {
  title: string;
  company: string;
  location: string | null;
  durationFrom: string;
  durationTo: string | null;
  activeJob: boolean;
  description: string | null;
  certificates: PublicExperienceCertificate[];
  skills: string[];
}

export interface PublicResume {
  url: string;
}

interface Envelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  statusCode: number;
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/v1",
    // No credentials — public API is open-CORS, no cookies involved.
  }),
  tagTypes: ["PublicUser"],
  endpoints: (builder) => ({
    getUserInfo: builder.query<PublicUserInfo | null, string>({
      query: (userId) => `/${userId}/user-info`,
      transformResponse: (res: Envelope<PublicUserInfo>) => res.data,
      providesTags: (_result, _error, userId) => [{ type: "PublicUser", id: userId }],
    }),

    getProjects: builder.query<
      PublicProject[],
      { userId: string; tag?: string; limit?: number }
    >({
      query: ({ userId, tag, limit }) => ({
        url: `/${userId}/projects`,
        params: { ...(tag ? { tag } : {}), ...(limit !== undefined ? { limit } : {}) },
      }),
      transformResponse: (res: Envelope<PublicProject[]>) => res.data ?? [],
      providesTags: (_result, _error, { userId }) => [{ type: "PublicUser", id: userId }],
    }),

    getExperience: builder.query<
      PublicExperience[],
      { userId: string; limit?: number }
    >({
      query: ({ userId, limit }) => ({
        url: `/${userId}/experience`,
        params: limit !== undefined ? { limit } : {},
      }),
      transformResponse: (res: Envelope<PublicExperience[]>) => res.data ?? [],
      providesTags: (_result, _error, { userId }) => [{ type: "PublicUser", id: userId }],
    }),

    getSkills: builder.query<string[], { userId: string; limit?: number }>({
      query: ({ userId, limit }) => ({
        url: `/${userId}/skills`,
        params: limit !== undefined ? { limit } : {},
      }),
      transformResponse: (res: Envelope<string[]>) => res.data ?? [],
      providesTags: (_result, _error, { userId }) => [{ type: "PublicUser", id: userId }],
    }),

    getTags: builder.query<string[], { userId: string; limit?: number }>({
      query: ({ userId, limit }) => ({
        url: `/${userId}/tags`,
        params: limit !== undefined ? { limit } : {},
      }),
      transformResponse: (res: Envelope<string[]>) => res.data ?? [],
      providesTags: (_result, _error, { userId }) => [{ type: "PublicUser", id: userId }],
    }),

    getResume: builder.query<PublicResume | null, string>({
      query: (userId) => `/${userId}/resume`,
      transformResponse: (res: Envelope<PublicResume>) => res.data,
      providesTags: (_result, _error, userId) => [{ type: "PublicUser", id: userId }],
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useGetProjectsQuery,
  useGetExperienceQuery,
  useGetSkillsQuery,
  useGetTagsQuery,
  useGetResumeQuery,
} = publicApi;
