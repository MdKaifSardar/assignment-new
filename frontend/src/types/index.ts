export type Role = 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt?: string;
  rating?: number | string;
}

export interface StoreOwner {
  id: string;
  name: string;
  email: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  rating: number;
  ratingCount?: number;
  overallRating?: number;
  userSubmittedRating?: number | null;
  owner?: StoreOwner | null;
  createdAt?: string;
}

export interface RatingItem {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  rating: number;
  submittedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}
