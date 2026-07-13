export type Experience = {
  id: string;
  title: string;
  location: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  tags: string[];
  description: string;
  host: string;
  capacity: number;
};

export type Booking = {
  id: string;
  experience?: string;
  experienceId?: string;
  hostId?: string;
  userId?: string;
  userName?: string;
  date: string;
  guests: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Denied";
  amount: number;
  reviewed?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Review = {
  id: string;
  bookingId: string;
  experienceId: string;
  experienceTitle: string;
  userId: string;
  hostId?: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
};

export type { UserProfile } from "./user";
