import { createSlice, PayloadAction } from "@reduxjs/toolkit";


type UserState = {
    name: string,
    phone: string,
}

const initialState: UserState = {
    name: "",
    phone: "",
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.name = action.payload.name;
            state.phone = action.payload.phone;
        },
        resetUser() {
            return initialState;
        }
    }
})

export const{setUser, resetUser} = userSlice.actions;
export default userSlice.reducer;