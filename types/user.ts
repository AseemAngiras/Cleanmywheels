// User Account Types
export type UserAccountType = 'Seeker' | 'Provider' | 'Admin' | 'SuperAdmin';

// User Status
export type Status = 'Active' | 'Inactive' | 'Suspended' | 'Pending';

// User Type
export interface User {
    _id: string;
    name: string;
    email?: string;
    countryCode: string;
    phone: string;
    formattedPhone: string;
    accountType: UserAccountType;
    status: Status;
    avatar?: string;
    authTokenIssuedAt: number;
    isMobileVerified: boolean;
}
