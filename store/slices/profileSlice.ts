import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Address = {
  id: string;
  houseOrFlatNo: string;
  locality: string;
  landmark?: string;
  city: string;
  postalCode: string;
  addressType: "Home" | "Work";
  fullAddress: string;
  latitude?: number;
  longitude?: number;
};

interface ProfileState {
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  defaultAddressId?: string;
  avatar?: string;
}

const initialState: ProfileState = {
  name: "",
  phone: "",
  email: "",
  addresses: [],
  defaultAddressId: undefined,
  avatar: "https://i.pravatar.cc/150?img=12", // Default avatar
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateProfile<K extends keyof ProfileState>(
      state: any,
      action: PayloadAction<{ key: K; value: ProfileState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },

    setAvatar(state, action: PayloadAction<string>) {
      state.avatar = action.payload;
    },

    addAddress(state, action: PayloadAction<Address>) {
      const exists = state.addresses.find(
        (addr) => addr.fullAddress === action.payload.fullAddress
      );
      if (!exists) {
        state.addresses.push(action.payload);
        // If it's the first address, make it default
        if (state.addresses.length === 1) {
          state.defaultAddressId = action.payload.id;
        }
      }
    },

    removeAddresses(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );
      // If default address is removed, reset defaultAddressId or pick another
      if (state.defaultAddressId === action.payload) {
        state.defaultAddressId =
          state.addresses.length > 0 ? state.addresses[0].id : undefined;
      }
    },

    setDefaultAddress(state, action: PayloadAction<string>) {
      state.defaultAddressId = action.payload;
    },

    resetProfile() {
      return initialState;
    },
  },
});

export const {
  updateProfile,
  resetProfile,
  addAddress,
  removeAddresses,
  setDefaultAddress,
  setAvatar,
} = profileSlice.actions;
export default profileSlice.reducer;
