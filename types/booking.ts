export interface Booking {
  id: string;
  _id?: string;
  center?: string;
  date: string;
  timeSlot: string;
  car: string;
  plate?: string;
  address?: any;
  phone?: string;
  carImage?: string;
  price: number;
  serviceName: string;
  serviceId?: string;
  status: string;
  realStatus?: string;
  workerName?: string;
  workerPhone?: string;
  addons?: {
    addOn: any;
    price: number;
    normalPrice?: number;
  }[];
  addonsTotal?: number;
  // Raw fields from backend sometimes present
  washPackage?: any;
  vehicle?: any;
  bookingDate?: string;
}
