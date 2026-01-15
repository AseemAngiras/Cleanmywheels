import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserSubscription } from "@/types/subscription";
import { subscriptionApi } from "../api/subscriptionApi";

interface SubscriptionState {
  activeSubscription: UserSubscription | null;
  isLoading: boolean;
}

const initialState: SubscriptionState = {
  activeSubscription: null,
  isLoading: false,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscription(state, action: PayloadAction<UserSubscription | null>) {
      state.activeSubscription = action.payload;
    },
    clearSubscription(state) {
      state.activeSubscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        subscriptionApi.endpoints.getMySubscription.matchFulfilled,
        (state, { payload }) => {
          state.activeSubscription = payload;
          state.isLoading = false;
        }
      )
      .addMatcher(
        subscriptionApi.endpoints.getMySubscription.matchPending,
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        subscriptionApi.endpoints.getMySubscription.matchRejected,
        (state) => {
          state.activeSubscription = null;
          state.isLoading = false;
        }
      );
  },
});

export const { setSubscription, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
