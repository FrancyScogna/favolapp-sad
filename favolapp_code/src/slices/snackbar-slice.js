import { createSlice } from '@reduxjs/toolkit';

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    open: false,
    message: '',
    severity: 'success',
    trigResetTimer: false,
  },
  reducers: {
    showSnackbar: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
      state.trigResetTimer = true;
    },
    hideSnackbar: (state) => {
      state.open = false;
      state.message;
      state.severity;
      state.trigResetTimer = false;
    },
    trigResetTimerSnackbar: (state) => {
      state.trigResetTimer = false;
    },
  },
});

export const { showSnackbar, hideSnackbar, trigResetTimerSnackbar } =
  snackbarSlice.actions;
export default snackbarSlice.reducer;
