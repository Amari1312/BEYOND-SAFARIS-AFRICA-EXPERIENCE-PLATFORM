"use client";

import { useEffect, useState } from "react";
import { BarChart3, CalendarClock, CircleDollarSign, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserBusiness, getBusinessExperiences } from "@/utils/firebase-data";
import { useRouter } from "next/navigation";
import type { Experience } from "@/types";

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userBusiness = await getUserBusiness(user.uid);
          setBusiness(userBusiness);
          
          if (userBusiness) {
            const bizExperiences = await getBusinessExperiences(userBusiness.id);
            setExperiences(bizExperiences);
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-300">Business dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-teal-50">Welcome to your business dashboard</h1>
          </div>
          <Button>
            <Plus size={18} />
            New experience
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Revenue" value="Ksh 0" detail="Up 0% this month" icon={<CircleDollarSign size={21} />} />
          <StatCard label="Bookings" value="0" detail="0 pending action" icon={<CalendarClock size={21} />} />
          <StatCard label="Rating" value="0.0" detail="From 0 reviews" icon={<Star size={21} />} />
          <StatCard label="Conversion" value="0%" detail="Listing to booking" icon={<BarChart3 size={21} />} />
        </div>
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Create experience</h2>
            <form className="mt-5 grid gap-4">
              <FormField label="Title" placeholder="Experience title" />
              <FormField label="Location" placeholder="County or city" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Price" type="number" placeholder="120" />
                <FormField label="Capacity" type="number" placeholder="8" />
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  className="min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
                  placeholder="Describe the experience"
                />
              </label>
              <Button>Submit for approval</Button>
            </form>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Booking management</h2>
            <div className="mt-4 grid gap-3">
              {/* Bookings are 0 for new host */}
              <div className="py-6 text-center text-sm text-slate-500">
                You have no active bookings at the moment.
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {experiences.length === 0 ? (
              <div className="col-span-full py-6 text-center text-sm text-slate-500">
                No experiences created yet.
              </div>
            ) : (
              experiences.map((experience) => (
                <div key={experience.id} className="rounded-lg bg-stone-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{experience.title}</p>
                  <p className="mt-3 text-2xl font-bold">{experience.reviews || 0}</p>
                  <p className="text-sm text-slate-600">reviews · {experience.rating || 0} rating</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
