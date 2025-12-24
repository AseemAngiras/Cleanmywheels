import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Car = {
    id: string,
    name: string,
    type: string,
    number: string,
    image: string,
}

type UserState = {
    name: string,
    phone: string,
    cars: Car[],
}

const initialState: UserState = {
    name: "",
    phone: "",
    cars: [],
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<{name: string, phone: string}>) {
            state.name = action.payload.name;
            state.phone = action.payload.phone;
        },

        addCar(state, action: PayloadAction<Car>){
            state.cars.push(action.payload);
        },

        updateCar(state, action: PayloadAction<Car>) {
            const index = state.cars.findIndex(
                (car) => car.id === action.payload.id
            );
            if(index !== -1) {
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

export const{setUser, resetUser, addCar, removeCar, updateCar} = userSlice.actions;
export default userSlice.reducer;