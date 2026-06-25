import { platformApi } from '../../app/api';
import type { UserDto } from './authSlice';

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export const authApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, any>({
      query: (credentials) => ({
        url: '/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logoutBackend: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/v1/auth/logout',
        method: 'POST',
      }),
    }),
    activate: builder.mutation<void, any>({
      query: (body) => ({
        url: '/v1/auth/activate',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<void, any>({
      query: (body) => ({
        url: '/v1/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<void, any>({
      query: (body) => ({
        url: '/v1/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutBackendMutation,
  useActivateMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
