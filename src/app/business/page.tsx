"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, CalendarClock, CircleDollarSign, ImagePlus, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { auth, db, storage } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";
import { getUserProfile } from "@/utils/firebase-data";

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async (uid: string) => {
    const [expSnap, bookSnap] = await Promise.all([
      getDocs(query(collection(db, "experiences"), where("hostId", "==", uid))),
      getDocs(query(collection(db, "bookings"), where("hostId", "==", uid))),
    ]);
    setExperiences(expSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setBookings(bookSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        await fetchData(user.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !price) {
      setFormError("Title, location, and price are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile && currentUser) {
        const storageRef = ref(storage, `experiences/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "experiences"), {
        title,
        location,
        price: Number(price),
        capacity: Number(capacity) || 0,
        description,
        imageUrl,
        hostId: currentUser!.uid,
        host: profile?.name || "Business Host",
        createdAt: serverTimestamp(),
        status: "active",
        rating: 0,
        reviews: 0,
      });

      // Reset form
      setTitle("");
      setLocation("");
      setPrice("");
      setCapacity("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setSuccess("Experience created successfully!");
      setTimeout(() => setSuccess(""), 4000);

      // Refresh data
      await fetchData(currentUser!.uid);
    } catch (err: any) {
      console.error("Error creating experience:", err);
      setFormError("Failed to create experience: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-950">
      <Navbar profileHref="/business" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-300">Business dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-teal-50">
              Welcome{profile?.name ? `, ${profile.name}` : ""}
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Revenue" value="Ksh 0" detail="Up 0% this month" icon={<CircleDollarSign size={21} />} />
          <StatCard label="Bookings" value={bookings.length.toString()} detail={`${bookings.filter(b => b.status === 'Pending').length} pending`} icon={<CalendarClock size={21} />} />
          <StatCard label="Rating" value="0.0" detail="From 0 reviews" icon={<Star size={21} />} />
          <StatCard label="Experiences" value={experiences.length.toString()} detail="Created" icon={<BarChart3 size={21} />} />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Create Experience Form */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Create experience</h2>
            {success && <p className="mt-2 text-sm text-emerald-600 font-medium">{success}</p>}
            {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}
            <form onSubmit={handleCreateExperience} className="mt-5 grid gap-4">
              <FormField
                label="Title"
                placeholder="Experience title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <FormField
                label="Location"
                placeholder="County or city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Price (Ksh)"
                  type="number"
                  placeholder="5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <FormField
                  label="Capacity"
                  type="number"
                  placeholder="8"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 resize-none"
                  placeholder="Describe the experience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              {/* Image upload (optional) */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Image <span className="font-normal text-slate-400">(optional)</span></p>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 rounded-full bg-white p-1 shadow"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-6 text-sm text-slate-500 hover:border-teal-500 hover:text-teal-600 transition"
                  >
                    <ImagePlus size={18} />
                    Click to upload image
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : <><Plus size={16} /> Create experience</>}
              </Button>
            </form>
          </div>

          {/* Bookings */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Booking management</h2>
            <div className="mt-4 grid gap-3">
              {bookings.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No active bookings yet.
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="font-semibold">{booking.experience || "Experience"}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {booking.date} · {booking.guests} guests · {booking.id.slice(0, 8)}
                      </p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                          booking.status === "Pending" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                        }`}>{booking.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary">Message</Button>
                      <Button>Manage</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* My Experiences */}
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">My Experiences</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.length === 0 ? (
              <div className="col-span-full py-6 text-center text-sm text-slate-500">
                No experiences created yet. Use the form above to add one!
              </div>
            ) : (
              experiences.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  {exp.imageUrl ? (
                    <img src={exp.imageUrl} alt={exp.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">No image</div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold">{exp.title}</p>
                    <p className="text-sm text-slate-500">{exp.location}</p>
                    <p className="mt-1 text-sm font-bold text-teal-700">Ksh {exp.price?.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">{exp.reviews || 0} reviews · {exp.rating || 0} ⭐</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
