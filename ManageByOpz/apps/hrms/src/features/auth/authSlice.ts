import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  permissions?: string[];
}

interface AuthState {
  user: UserDto | null;
  role: string | null;
  tenant: string | null;
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  role: localStorage.getItem('role'),
  tenant: localStorage.getItem('tenant') || 'default',
  permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
      user: UserDto;
      permissions?: string[];
    }>) => {
      const { accessToken, refreshToken, user, permissions } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.role = user.role;
      state.tenant = user.tenantId;
      state.permissions = permissions || user.permissions || [];
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', user.role);
      localStorage.setItem('tenant', user.tenantId);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(state.permissions));
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.role = null;
      state.tenant = 'default';
      state.permissions = [];
      state.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('tenant');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    },
    updateAccessToken: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    }
  },
});

export const { setCredentials, logout, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
