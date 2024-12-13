import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth-slice';
import snackbarReducer from '../slices/snackbar-slice';

const store = configureStore({
  reducer: {
    snackbar: snackbarReducer,
    auth: authReducer,
  },
});

export default store;
