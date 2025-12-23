import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  center: string;
  date: string;
  timeSlot: string;
  car: string;
  carImage: string;
  phone: string;
  price: string;
  address: string;
  plate: string;
  serviceName: string;
  status: BookingStatus;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Partial<Booking>;
}

const initialState: BookingState = {
  bookings: [
    {
      id: "1",
      center: "Auto Care Plus",
      date: "2024-02-20",
      timeSlot: "2:30 PM",
      car: "Honda Accord",
      carImage:
        "https://images.pexels.com/photos/4906936/pexels-photo-4906936.jpeg",
      phone: "+1 (555) 987-6543",
      price: "$75",
      address: "456 Oak Avenue, Springfield",
      plate: "XYZ789",
      serviceName: "Tire Rotation",
      status: "upcoming",
    },
    {
      id: "2",
      center: "Auto Care minus",
      date: "2024-02-20",
      timeSlot: "12:30 PM",
      car: "Honda Gini",
      carImage:
        "https://images.pexels.com/photos/4906936/pexels-photo-4906936.jpeg",
      phone: "+1 (555) 987-6543",
      price: "$125",
      address: "456 Oak Avenue, Springfield",
      plate: "XYZ789",
      serviceName: "Tire Rotation",
      status: "upcoming",
    },
  ],
  currentBooking : {},
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    updateCurrentBooking(state, action: PayloadAction<{key: keyof Booking; value: any }>){
      state.currentBooking[action.payload.key] = action.payload.value;
    },

    confirmBooking(state) {
     state.bookings.push({
      ...(state.currentBooking as Booking),
      id: nanoid(),
      status: "upcoming",
     });
     state.currentBooking = {};
    },

    completeBooking(state, action: PayloadAction<string>) {
      const booking = state.bookings.find(
        (b) => b.id === action.payload
      );
      if (booking) {
        booking.status = "completed"
      }
    },

    cancelBooking(state, action: PayloadAction<string>) {
      const booking = state.bookings.find(
        (b) => b.id === action.payload
      );
      if (booking) {
        booking.status = "cancelled";
      }
    },

    resetBookings(state) {
      state.bookings = [];
      state.currentBooking = {};
    }
  },
});

export const { completeBooking, cancelBooking, updateCurrentBooking, confirmBooking, resetBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
