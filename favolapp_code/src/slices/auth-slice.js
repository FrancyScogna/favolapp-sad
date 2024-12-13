import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    role: null,
    user: null,
    refresh: false,
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.user = action.payload.user;
    },
    editAuthUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload.user,
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
    },
    refresh: (state) => {
      state.refresh = !state.refresh;
    },
  },
});

export const { login, logout, refresh, editAuthUser } = authSlice.actions;
export default authSlice.reducer;
