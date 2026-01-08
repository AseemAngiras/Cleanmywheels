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
  price: number;
  address: string;
  plate: string;
  serviceName: string;
  serviceId?: string;
  status: BookingStatus;
  houseOrFlatNo?: string;
  locality?: string;
  city?: string;
  postalCode?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'open' | 'resolved';
  refundRequested?: boolean;
}

interface BookingState {
  bookings: Booking[];
  tickets: Ticket[];
  currentBooking: Partial<Booking>;
}

const initialState: BookingState = {
  bookings: [],
  tickets: [],
  currentBooking: {},
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    addBooking(state, action: PayloadAction<Omit<Booking, "id" | "status">>) {
      state.bookings.push({
        ...action.payload,
        id: nanoid(),
        status: "upcoming",
      })
    },

    addTicket(state, action: PayloadAction<Omit<Ticket, "id" | "status">>) {
      state.tickets.push({
        ...action.payload,
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "open",
      });
    },

    completeBooking(state, action: PayloadAction<string>) {
      const booking = state.bookings.find((b) => b.id === action.payload);
      if (booking) booking.status = "completed";
    },

    cancelBooking(state, action: PayloadAction<string>) {
      const booking = state.bookings.find((b) => b.id === action.payload);
      if (booking) booking.status = "cancelled";
    },

    resetBookings(state) {
      state.bookings = [];
      state.currentBooking = {};
    },


    setBookingAddress(state, action: PayloadAction<{ addressId: string }>) {
      state.currentBooking.address = action.payload.addressId;
    },

    setBookingService(state, action: PayloadAction<{ serviceName: string, price: number }>) {
      state.currentBooking.serviceName = action.payload.serviceName;
      state.currentBooking.price = action.payload.price;
    },

    setBookingCar(state, action: PayloadAction<{ car: string, plate: string, carImage: string }>) {
      state.currentBooking.car = action.payload.car;
      state.currentBooking.plate = action.payload.plate;
      state.currentBooking.carImage = action.payload.carImage;
    },

    setBookingSlot(state, action: PayloadAction<{ date: string, timeSlot: string }>) {
      state.currentBooking.date = action.payload.date;
      state.currentBooking.timeSlot = action.payload.timeSlot;
    },

    clearCurrentBooking(state) {
      state.currentBooking = {};
    }
  },
});

export const {
  completeBooking,
  cancelBooking,
  addBooking,
  addTicket,
  resetBookings,
  setBookingAddress,
  setBookingCar,
  setBookingService,
  setBookingSlot,
} = bookingSlice.actions;
export default bookingSlice.reducer;
