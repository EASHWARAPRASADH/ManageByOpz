import { configureStore } from '@reduxjs/toolkit';
import { platformApi } from './api';
import authReducer from '../features/auth/authSlice';
import employeesReducer from '../features/employees/employeesSlice';

/**
 * Redux Store — Central state management for the HR Platform.
 *
 * Uses RTK Query for API caching and Redux Toolkit slices for client state.
 * Modules register their own slices and API endpoints via injectEndpoints.
 */
export const store = configureStore({
  reducer: {
    [platformApi.reducerPath]: platformApi.reducer,
    auth: authReducer,
    employees: employeesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(platformApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
