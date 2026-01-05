import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { addressApi } from "./api/addressApi";
import { authApi } from "./api/authApi";
import { bookingApi } from "./api/bookingApi";
import { vehicleApi } from "./api/vehicleApi";
import { washPackageApi } from "./api/washPackageApi";
import authReducer, { logout } from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import profileReducer from "./slices/profileSlice";
import userReducer from "./slices/userSlice";

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  bookings: bookingReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
  [addressApi.reducerPath]: addressApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [vehicleApi.reducerPath]: vehicleApi.reducer,
  [washPackageApi.reducerPath]: washPackageApi.reducer,
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
    getDefaultMiddleware().concat(
      authApi.middleware,
      addressApi.middleware,
      bookingApi.middleware,
      vehicleApi.middleware,
      washPackageApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
