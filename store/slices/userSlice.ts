import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Car = {
    id: string,
    name: string,
    type: string,
    number: string,
    image: string,
}


type UserState = {
    user: User | null;
    cars: Car[];
}

const initialState: UserState = {
    user: null,
    cars: [],
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },

        updateUser(state, action: PayloadAction<Partial<User>>) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        addCar(state, action: PayloadAction<Car>) {
            const existingCar = state.cars.find(
                car => car.number.toUpperCase() === action.payload.number.toUpperCase()
            );
            if (!existingCar) {
                state.cars.push(action.payload);
            }
        },

        updateCar(state, action: PayloadAction<Car>) {
            const index = state.cars.findIndex(
                (car) => car.id === action.payload.id
            );
            if (index !== -1) {
                state.cars[index] = action.payload;
            }
        },

        removeCar(state, action: PayloadAction<string>) {
            state.cars = state.cars.filter((car) => car.id !== action.payload);
        },

        resetUser() {
            return initialState;
        }
    }
})

export const { setUser, updateUser, resetUser, addCar, removeCar, updateCar } = userSlice.actions;
export default userSlice.reducer;