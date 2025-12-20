import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AuthSlice {
    isLoggedInd : boolean,
    token: string | null,
}

const initialState: AuthSlice = {
    isLoggedInd: false,
    token: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action : PayloadAction<string >){
            state.isLoggedInd = true;
            state.token = action.payload;
        },
        logout(state) {
            state.isLoggedInd = false;
            state.token = null;
        }
    }
});

export const {loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;