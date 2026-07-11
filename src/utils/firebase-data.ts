import { collection, query, getDocs, doc, getDoc, onSnapshot, Query, DocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Experience, Booking } from "@/types";

/**
 * Fetch all experiences from Firestore
 */
export async function getExperiences(): Promise<Experience[]> {
  try {
    const experiencesCollection = collection(db, "experiences");
    const snapshot = await getDocs(experiencesCollection);
    const experiences = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Experience));
    return experiences;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
}

/**
 * Subscribe to real-time experience updates
 */
export function onExperiencesChange(callback: (experiences: Experience[]) => void) {
  try {
    const experiencesCollection = collection(db, "experiences");
    return onSnapshot(experiencesCollection, (snapshot) => {
      const experiences = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Experience));
      callback(experiences);
    });
  } catch (error) {
    console.error("Error subscribing to experiences:", error);
    return () => { };
  }
}

/**
 * Fetch a single experience by ID
 */
export async function getExperienceById(id: string): Promise<Experience | null> {
  try {
    const experienceDoc = doc(db, "experiences", id);
    const snapshot = await getDoc(experienceDoc);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Experience;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching experience ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all events from Firestore
 */
export async function getEvents() {
  try {
    const eventsCollection = collection(db, "events");
    const snapshot = await getDocs(eventsCollection);
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Subscribe to real-time event updates
 */
export function onEventsChange(callback: (events: any[]) => void) {
  try {
    const eventsCollection = collection(db, "events");
    return onSnapshot(eventsCollection, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(events);
    });
  } catch (error) {
    console.error("Error subscribing to events:", error);
    return () => { };
  }
}

/**
 * Fetch user bookings
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsCollection = collection(db, "bookings");
    const q = query(bookingsCollection);
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as any))
      .filter((b) => b.userId === userId);
    return bookings as Booking[];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Subscribe to real-time user bookings
 */
export function onUserBookingsChange(userId: string, callback: (bookings: Booking[]) => void) {
  try {
    const bookingsCollection = collection(db, "bookings");
    return onSnapshot(bookingsCollection, (snapshot) => {
      const bookings = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as any))
        .filter((b) => b.userId === userId);
      callback(bookings as Booking[]);
    });
  } catch (error) {
    console.error("Error subscribing to bookings:", error);
    return () => { };
  }
}

/**
 * Fetch user trips
 */
export async function getUserTrips(userId: string) {
  try {
    const tripsCollection = collection(db, "trips");
    const snapshot = await getDocs(tripsCollection);
    const trips = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as any))
      .filter((t) => t.userId === userId);
    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}

/**
 * Subscribe to real-time user trips
 */
export function onUserTripsChange(userId: string, callback: (trips: any[]) => void) {
  try {
    const tripsCollection = collection(db, "trips");
    return onSnapshot(tripsCollection, (snapshot) => {
      const trips = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as any))
        .filter((t) => t.userId === userId);
      callback(trips);
    });
  } catch (error) {
    console.error("Error subscribing to trips:", error);
    return () => { };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = doc(db, "users", userId);
    const snapshot = await getDoc(userDoc);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Subscribe to real-time user profile changes
 */
export function onUserProfileChange(userId: string, callback: (user: any) => void) {
  try {
    const userDoc = doc(db, "users", userId);
    return onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }
    });
  } catch (error) {
    console.error("Error subscribing to user profile:", error);
    return () => { };
  }
}

/**
 * Get user's business (for business owners)
 */
export async function getUserBusiness(userId: string) {
  try {
    const businessCollection = collection(db, "businesses");
    const snapshot = await getDocs(businessCollection);
    const business = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as any))
      .find((b) => b.ownerId === userId);
    return business || null;
  } catch (error) {
    console.error("Error fetching business:", error);
    return null;
  }
}

/**
 * Get experiences for a specific business
 */
export async function getBusinessExperiences(businessId: string): Promise<Experience[]> {
  try {
    const experiencesCollection = collection(db, "experiences");
    const snapshot = await getDocs(experiencesCollection);
    const experiences = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as any))
      .filter((e) => e.businessId === businessId);
    return experiences as Experience[];
  } catch (error) {
    console.error("Error fetching business experiences:", error);
    return [];
  }
}

/**
 * Subscribe to real-time business experiences
 */
export function onBusinessExperiencesChange(businessId: string, callback: (experiences: Experience[]) => void) {
  try {
    const experiencesCollection = collection(db, "experiences");
    return onSnapshot(experiencesCollection, (snapshot) => {
      const experiences = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as any))
        .filter((e) => e.businessId === businessId);
      callback(experiences as Experience[]);
    });
  } catch (error) {
    console.error("Error subscribing to business experiences:", error);
    return () => { };
  }
}
