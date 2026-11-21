
import { apiSlice } from "./apiSlice";

// User type
export interface User {
  id: string;
  name: string;
  email: string;
}

// Auth response
interface AuthResponse {
  message: string;
  user: User;
}

// Signup payload
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// Login payload
interface LoginRequest {
  email: string;
  password: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Signup
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: "/signup",
        method: "POST",
        body,
      }),
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    // Get current logged-in user
    getMe: builder.query<User, void>({
      query: () => "/me",
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApiSlice;
