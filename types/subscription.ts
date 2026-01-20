export interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  description?: string;
  features: string[];
  razorpayPlanId: string;
  isActive: boolean;
}

export interface Addon {
  _id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface UserSubscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  vehicle: {
    _id: string;
    vehicleNo: string;
    brand: string;
    model: string;
    color: string;
    image?: string;
  };
  razorpaySubscriptionId?: string;
  status: "active" | "created" | "authenticated" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  servicesTotal: number;
  servicesCompleted: number;
  worker?: {
    _id: string;
    name: string;
    phone: string;
  };
  nextServiceAddons?: {
    addonId: Addon;
    name: string;
    price: number;
    paid: boolean;
    dateAdded: string;
  }[];
  serviceHistory?: {
    date: string;
    status: "completed" | "skipped";
    notes?: string;
  }[];
}

export interface RazorpaySubscriptionResponse {
  id: string; // razorpay_subscription_id
  entity: "subscription";
  plan_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at: number | null;
  quantity: number;
  notes: any;
  charge_at: number;
  short_url: string;
}
