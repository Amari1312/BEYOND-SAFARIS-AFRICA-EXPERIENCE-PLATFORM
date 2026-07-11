"use client";

import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getExperienceById } from "@/utils/firebase-data";
import { CalendarDays, Heart, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Experience } from "@/types";
import { auth, db } from "@/utils/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getUserProfile } from "@/utils/firebase-data";

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{name?: string; email?: string; phoneNumber?: string} | null>(null);

  // Booking form state
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchExperience = async () => {
      setLoading(true);
      const data = await getExperienceById(id);
      setExperience(data);
      setLoading(false);
    };
    fetchExperience();
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!date) {
      setBookingError("Please select a date.");
      return;
    }
    setBookingError("");
    setBookingLoading(true);

    try {
      await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || "Traveler",
        experienceId: id,
        experience: experience?.title,
        hostId: (experience as Experience & { hostId?: string })?.hostId || "",
        date,
        guests,
        amount: (experience?.price || 0) * guests,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      setBookingSuccess("Booking submitted! The host will confirm shortly.");
      setDate("");
      setGuests(1);
    } catch (err: unknown) {
      console.error("Booking error:", err);
      setBookingError("Failed to book: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <main className="flex items-center justify-center min-h-[68vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
            <p className="mt-3 text-sm text-slate-600">Loading experience...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <main className="flex items-center justify-center min-h-[68vh]">
          <p className="text-slate-600">Experience not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Use imageUrl (from Firestore new field) or fallback to image (mock data field)
  const imageSrc = (experience as Experience & { imageUrl?: string }).imageUrl || experience.image;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main>
        <section className="grid min-h-[68vh] lg:grid-cols-2">
          <div className="relative min-h-96 bg-slate-100">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={experience.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                No image available
              </div>
            )}
          </div>
          <div className="flex items-center px-4 py-10 sm:px-8 lg:px-14">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-teal-700">{experience.category || "Experience"}</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight">{experience.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <MapPin size={17} />
                  {experience.location}
                </span>
                <span className="flex items-center gap-2">
                  <Star size={17} className="fill-amber-400 text-amber-400" />
                  {experience.rating || 0} ({experience.reviews || 0} reviews)
                </span>
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-700">{experience.description}</p>
              {experience.tags && experience.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {experience.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="grid gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">What to expect</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <CalendarDays className="text-teal-700" />
                  <p className="mt-3 font-semibold">{experience.duration || "Full day"}</p>
                  <p className="text-sm text-slate-600">Flexible start times</p>
                </div>
                <div>
                  <Users className="text-teal-700" />
                  <p className="mt-3 font-semibold">Up to {experience.capacity || "—"}</p>
                  <p className="text-sm text-slate-600">Small group size</p>
                </div>
                <div>
                  <ShieldCheck className="text-teal-700" />
                  <p className="mt-3 font-semibold">Verified host</p>
                  <p className="text-sm text-slate-600">{experience.host || "Beyond Safari Host"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <div className="mt-4 text-sm text-slate-500">
                No reviews yet. Be the first to book!
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <p>
                <span className="text-3xl font-bold">Ksh {experience.price?.toLocaleString()}</span>
                <span className="text-slate-500"> / person</span>
              </p>
              <button className="rounded-lg border border-slate-200 p-2 text-slate-600" aria-label="Save to wishlist">
                <Heart size={20} />
              </button>
            </div>

            {bookingSuccess && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                {bookingSuccess}
              </div>
            )}
            {bookingError && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBook} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Date
                <input
                  type="date"
                  className="min-h-11 rounded-lg border border-slate-300 px-3"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Guests
                <input
                  type="number"
                  min="1"
                  max={experience.capacity || 20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="min-h-11 rounded-lg border border-slate-300 px-3"
                />
              </label>
              <div className="rounded-lg bg-stone-50 p-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Ksh {experience.price?.toLocaleString()} × {guests} guests</span>
                  <span className="font-semibold">Ksh {((experience.price || 0) * guests).toLocaleString()}</span>
                </div>
              </div>
              <Button type="submit" disabled={bookingLoading} className="w-full">
                {bookingLoading ? "Booking..." : currentUser ? "Book experience" : "Log in to book"}
              </Button>
              <Button href="/contact" variant="secondary">Start chat</Button>
            </form>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
