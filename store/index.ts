import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import profileReducer from "./slices/profileSlice";
import userReducer from "./slices/userSlice";
import { authApi } from "./api/authApi";

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  bookings: bookingReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    state = undefined;
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
