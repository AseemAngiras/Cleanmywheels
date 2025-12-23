import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
    name : string,
    phone: string,
    email?: string,
    address: string,
}

const initialState: ProfileState = {
    name: "",
    phone: "",
    email: "",
    address: "",
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

        resetProfile() {
            return initialState;
        }
        
    }
})

export const {updateProfile, resetProfile} = profileSlice.actions;
export default profileSlice.reducer;