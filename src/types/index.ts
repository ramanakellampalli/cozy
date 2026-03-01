export type UserRole = "OWNER" | "TENANT";
export type PropertyType = "HOSTEL" | "PG" | "COLIVING";
export type TenantStatus = "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "VACATED";
export type InviteStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  aadhar?: string;
  activePropertyId: string | null;
  propertyIds: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  city: string;
  address: string;
  ownerUid: string;
  requireApproval: boolean;
  totalRooms?: number;
  bedsPerRoom?: number;
  defaultRent?: number | null;
  defaultDeposit?: number | null;
  dueDay?: number | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface Invite {
  code: string;
  propertyId: string;
  type: "PROPERTY";
  status: InviteStatus;
  requireApproval: boolean;
  expiresAt: unknown;
  createdBy: string;
  createdAt: unknown;
}

export interface TenantRecord {
  uid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  aadhar?: string;
  status: TenantStatus;
  bedId: string | null;
  rentMonthly: number | null;
  deposit: number | null;
  moveInDate: unknown | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
