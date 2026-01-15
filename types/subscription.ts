export interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string; // e.g., "Monthly Premium"
  price: number;
  currency: string;
  durationDays: number;
  description?: string;
  features: string[]; // List of features for display
  razorpayPlanId: string; // Backend Plan ID
  isActive: boolean;
}

export interface UserSubscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan; // Populated plan details
  razorpaySubscriptionId: string;
  status: "active" | "created" | "authenticated" | "expired" | "cancelled";
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  autoRenew: boolean;
  paymentMethod?: string;
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
