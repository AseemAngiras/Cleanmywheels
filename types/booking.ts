export interface Booking {
    _id: string;
    houseOrFlatNo: number;
    locality: string;
    landmark: string;
    city: string;
    postalCode: string;
    addressType: string;
    washPackage: string | { name: string; price: number };
    user?: { name: string; phone: string; avatar?: string };
    address?: { fullAddress: string; locality: string };
    vehicleType: string;
    vehicleNo: string;
    bookingDate: string;
    bookingTime: number;
    status?: string;
    price?: number;
}
