export interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  tag?: string;
  price?: number;
  prices: {
    hatchback: { WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; TWICE_MONTHLY: number; ONE_TIME: number };
    sedan: { WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; TWICE_MONTHLY: number; ONE_TIME: number };
    suv: { WEEKLY: number; BIWEEKLY: number; ALTERNATE_DAY: number; TWICE_MONTHLY: number; ONE_TIME: number };
  };
  features: string[]; // Keep for compatibility
  includedServiceIds?: string[]; // New ID-based linking
  status: "Active" | "Inactive" | "Archived";
  razorpayPlanId?: string;
  frequencies?: {
    type: "WEEKLY" | "BIWEEKLY" | "ALTERNATE_DAY" | "TWICE_MONTHLY";
    label: string;
    description: string;
    multiplier: number;
    services: number;
  }[];
}

export interface Addon {
  _id: string;
  name: string;
  description: string;
  price: number; // Base/Fallback price
  normalPrice?: number;
  basePrice?: number;
  subscriptionPrice?: number;
  priceMatrix?: {
    ONE_TIME?: number;
    WEEKLY?: number;
    BIWEEKLY?: number;
    ALTERNATE_DAY?: number;
    TWICE_MONTHLY?: number;
  };
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
    vehicleType?: string;
  };
  razorpaySubscriptionId?: string;
  status: "active" | "created" | "authenticated" | "expired" | "cancelled" | "ongoing";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  servicesTotal: number;
  servicesCompleted: number;
  frequencyType?: "WEEKLY" | "BIWEEKLY" | "ALTERNATE_DAY" | "TWICE_MONTHLY";
  totalServicesPlanned?: number;
  serviceDates?: {
    date: string;
    status: "pending" | "completed" | "skipped";
    addons?: any[];
  }[];
  worker?: {
    _id: string;
    name: string;
    phone: string;
  };
  workerName?: string;
  workerPhone?: string;
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
  timeSlot: string;
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
