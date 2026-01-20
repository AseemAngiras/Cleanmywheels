import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { addressApi } from "./api/addressApi";
import { authApi } from "./api/authApi";
import { bookingApi } from "./api/bookingApi";
import { notificationApi } from "./api/notificationApi";
import { vehicleApi } from "./api/vehicleApi";
import { washPackageApi } from "./api/washPackageApi";
import { subscriptionApi } from "./api/subscriptionApi";
import authReducer, { logout } from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import profileReducer from "./slices/profileSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import userReducer from "./slices/userSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "profile", "user", "bookings", "subscription"],
};

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  bookings: bookingReducer,
  user: userReducer,
  subscription: subscriptionReducer,
  [authApi.reducerPath]: authApi.reducer,
  [addressApi.reducerPath]: addressApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [vehicleApi.reducerPath]: vehicleApi.reducer,
  [washPackageApi.reducerPath]: washPackageApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    AsyncStorage.removeItem("persist:root");
    state = undefined;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      addressApi.middleware,
      bookingApi.middleware,
      notificationApi.middleware,
      vehicleApi.middleware,
      washPackageApi.middleware,
      subscriptionApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
