export interface Booking {
  _id: string;
  houseOrFlatNo: string;
  locality: string;
  landmark: string;
  city: string;
  postalCode: string;
  addressType: string;
  washPackage: string;
  vehicleType: string;
  vehicleNo: string;
  bookingDate: string;
  bookingTime: number;
  status?: string;
  totalAmount?: number;
}
