"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Heart, MessageSquare, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { auth, db } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile, getUserBookings } from "@/utils/firebase-data";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { Booking, UserProfile } from "@/types";

export default function UserDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        try {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);

          const bookings = await getUserBookings(user.uid);
          setUserBookings(bookings);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmitReview = async (booking: Booking) => {
    const draft = reviewDrafts[booking.id];
    if (!draft || draft.rating < 1 || draft.rating > 5) {
      setReviewMessage("Please choose a rating before submitting.");
      return;
    }
    if (!draft.comment.trim()) {
      setReviewMessage("Please add a short review comment.");
      return;
    }

    setReviewSubmittingId(booking.id);
    setReviewMessage("");

    try {
      const experienceDoc = await getDoc(doc(db, "experiences", booking.experienceId || ""));
      const existingData = experienceDoc.exists() ? experienceDoc.data() : null;
      const existingReviews = Number(existingData?.reviews || 0);
      const existingRating = Number(existingData?.rating || 0);
      const nextReviews = existingReviews + 1;
      const nextRating = existingReviews === 0
        ? draft.rating
        : Number(((existingRating * existingReviews) + draft.rating) / nextReviews).toFixed(1);

      await addDoc(collection(db, "reviews"), {
        bookingId: booking.id,
        experienceId: booking.experienceId,
        experienceTitle: booking.experience || "Experience",
        userId: currentUserId,
        hostId: booking.hostId || "",
        rating: draft.rating,
        comment: draft.comment.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "bookings", booking.id), {
        reviewed: true,
        reviewSubmittedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "experiences", booking.experienceId || ""), {
        reviews: nextReviews,
        rating: Number(nextRating),
      });

      const refreshedBookings = await getUserBookings(currentUserId || "");
      setUserBookings(refreshedBookings);
      setReviewDrafts((prev) => ({ ...prev, [booking.id]: { rating: 5, comment: "" } }));
      setReviewMessage("Review submitted successfully.");
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewMessage("Unable to submit your review right now.");
    } finally {
      setReviewSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar profileHref="/user/profile" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">Traveler dashboard</p>
            <h1 className="mt-1 text-3xl font-bold">My trips</h1>
          </div>
          <Button>Update profile</Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Bookings" value={userBookings.length.toString()} detail={`${userBookings.filter(b => b.status === "Pending" || b.status === "Confirmed").length} upcoming trips`} icon={<CalendarCheck size={21} />} />
          <StatCard label="Wishlist" value="0" detail="Saved experiences" icon={<Heart size={21} />} />
          <StatCard label="Reviews" value="0" detail="Average rating 0.0" icon={<Star size={21} />} />
          <StatCard label="Messages" value="0" detail="Open host chats" icon={<MessageSquare size={21} />} />
        </div>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Bookings</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3">ID</th>
                    <th>Experience</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        You have no bookings yet. Time to plan an adventure!
                      </td>
                    </tr>
                  ) : (
                    userBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100">
                        <td className="py-4 font-semibold">{booking.id}</td>
                        <td>{booking.experience}</td>
                        <td>{booking.date}</td>
                        <td>{booking.guests}</td>
                        <td>
                          <span className={`rounded-md px-2 py-1 font-medium ${booking.status === "Confirmed" ? "bg-emerald-50 text-emerald-800" :
                            booking.status === "Pending" ? "bg-amber-50 text-amber-800" :
                              "bg-red-50 text-red-800"
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-right font-semibold">Ksh {booking.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <User className="text-teal-700" size={28} />
            <h2 className="mt-4 text-xl font-semibold">Profile</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Name:</span> {profile?.name || "Traveler"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Email:</span> {profile?.email || "No email"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Phone:</span> {profile?.phoneNumber || "Not provided"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Preference:</span> {profile?.preference || "None set"}
              </p>
            </div>
          </aside>
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Leave a review</h2>
            {reviewMessage ? <p className="text-sm text-emerald-600">{reviewMessage}</p> : null}
          </div>
          <div className="mt-4 grid gap-4">
            {userBookings.filter((booking) => booking.status === "Confirmed" && !booking.reviewed).length === 0 ? (
              <p className="text-sm text-slate-500">Confirmed bookings will appear here once you are ready to leave feedback.</p>
            ) : (
              userBookings
                .filter((booking) => booking.status === "Confirmed" && !booking.reviewed)
                .map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{booking.experience || "Experience"}</p>
                        <p className="text-sm text-slate-500">{booking.date} · {booking.guests} guests</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]">
                      <label className="text-sm font-medium text-slate-700">
                        Rating
                        <select
                          className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 px-3"
                          value={reviewDrafts[booking.id]?.rating ?? 5}
                          onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [booking.id]: { ...prev[booking.id], rating: Number(event.target.value) } }))}
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-slate-700">
                        Review
                        <textarea
                          className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                          placeholder="Share what made your experience special"
                          value={reviewDrafts[booking.id]?.comment ?? ""}
                          onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [booking.id]: { ...prev[booking.id], comment: event.target.value, rating: prev[booking.id]?.rating ?? 5 } }))}
                        />
                      </label>
                      <Button onClick={() => handleSubmitReview(booking)} disabled={reviewSubmittingId === booking.id}>
                        {reviewSubmittingId === booking.id ? "Submitting..." : "Submit review"}
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
