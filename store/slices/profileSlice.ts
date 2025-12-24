import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Address = {
  id: string;
  flatNumber: string;
  buildingName: string;
  locality: string;
  landmark?: string;
  city: string;
  pincode: string;
  addressType: 'Home' | 'Work';
  fullAddress: string;
  latitude?: number;
  longitude?: number;
};

interface ProfileState {
    name : string,
    phone: string,
    email?: string,
    addresses: Address[],
}

const initialState: ProfileState = {
    name: "",
    phone: "",
    email: "",
    addresses: [],
}

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        updateProfile<K extends keyof ProfileState> (
            state : any,
            action: PayloadAction<{ key : K; value : ProfileState[K]}>
        ) {
            state[action.payload.key] = action.payload.value;
        },

        addAddress(state, action: PayloadAction<Address>) {
            const exists = state.addresses.find(
                addr => addr.fullAddress === action.payload.fullAddress
            );
            if(!exists) {
                state.addresses.push(action.payload);
            }
        },

        removeAddresses(state, action:PayloadAction<string>){
            state.addresses = state.addresses.filter(
                addr => addr.id !== action.payload
            )
        },

        resetProfile() {
            return initialState;
        }
        
    }
})

export const {updateProfile, resetProfile, addAddress, removeAddresses} = profileSlice.actions;
export default profileSlice.reducer;