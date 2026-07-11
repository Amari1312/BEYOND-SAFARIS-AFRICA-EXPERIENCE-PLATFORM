"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { auth, db } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "Admin") {
            setLoading(false);
          } else {
            router.push("/profile");
          }
        } catch (error) {
          router.push("/profile");
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="admin" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-teal-700">Admin dashboard</p>
          <h1 className="mt-1 text-3xl font-bold">Hello, Admin!</h1>
          <h1 className="mt-1 text-3xl font-bold">Platform oversight</h1>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Users" value="0" detail="0 new this week" icon={<Users size={21} />} />
          <StatCard label="Approvals" value="0" detail="Listings awaiting review" icon={<CheckCircle2 size={21} />} />
          <StatCard label="Reports" value="0" detail="Open moderation cases" icon={<AlertTriangle size={21} />} />
          <StatCard label="Roles" value="3" detail="Traveler, Business, Admin" icon={<Shield size={21} />} />
        </div>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Listing approval</h2>
            <div className="mt-4 py-6 text-center text-sm text-slate-500">
              No experiences awaiting approval.
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="text-teal-700" size={28} />
            <h2 className="mt-4 text-xl font-semibold">Reports</h2>
            <div className="mt-4 py-6 text-center text-sm text-slate-500">
              No open reports.
            </div>
          </div>
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">User management</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">No users found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
