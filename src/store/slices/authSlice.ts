import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AuthSlice {
    isLoggedIn: boolean,
    token: string | null,
}

const initialState: AuthSlice = {
    isLoggedIn: false,
    token: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<string>) {
            state.isLoggedIn = true;
            state.token = action.payload;
        },
        logout(state) {
            state.isLoggedIn = false;
            state.token = null;
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
