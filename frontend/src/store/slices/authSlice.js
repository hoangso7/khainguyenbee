import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../lib/api.js';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    const response = await apiService.login(credentials.username, credentials.password);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await apiService.logout();
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    const response = await apiService.getCurrentUser();
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
