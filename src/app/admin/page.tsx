"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Shield, Users, CalendarCheck, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { auth, db } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    experiences: 0,
    bookings: 0,
    businesses: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    let usersUnsub: (() => void) | null = null;
    let expUnsub: (() => void) | null = null;
    let bookUnsub: (() => void) | null = null;
    let bizUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== "Admin") {
          router.push("/profile");
          return;
        }

        const usersQuery = collection(db, "users");
        const experiencesQuery = collection(db, "experiences");
        const bookingsQuery = collection(db, "bookings");
        const businessesQuery = collection(db, "businesses");

        const updateCounts = (usersSnap: any, expSize: number, bookSize: number, bizSize: number) => {
          const usersList = usersSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
          const dedupedByEmail = new Map<string, any>();
          usersList.forEach((u: any) => {
            if (u?.email) dedupedByEmail.set(String(u.email).toLowerCase(), u);
          });
          const uniqueUsers = Array.from(dedupedByEmail.values());

          const businessCountFromUsers = uniqueUsers.filter((u: any) => u.role === "BusinessOwner").length;
          const businessCount = bizSize || businessCountFromUsers;

          setStats({
            users: usersSnap.size,
            experiences: expSize,
            bookings: bookSize,
            businesses: businessCount,
          });
          setRecentUsers(uniqueUsers.slice(-5).reverse());
        };

        let currentExpSize = 0;
        let currentBookSize = 0;
        let currentBizSize = 0;

        usersUnsub = onSnapshot(usersQuery, (usersSnap) => {
          currentExpSize = currentExpSize ?? 0;
          currentBookSize = currentBookSize ?? 0;
          currentBizSize = currentBizSize ?? 0;
          updateCounts(usersSnap, currentExpSize, currentBookSize, currentBizSize);
          setLoading(false);
        });

        expUnsub = onSnapshot(experiencesQuery, (expSnap) => {
          currentExpSize = expSnap.size;
          setStats((prev) => ({ ...prev, experiences: expSnap.size }));
        });

        bookUnsub = onSnapshot(bookingsQuery, (bookSnap) => {
          currentBookSize = bookSnap.size;
          setStats((prev) => ({ ...prev, bookings: bookSnap.size }));
        });

        bizUnsub = onSnapshot(businessesQuery, (bizSnap) => {
          currentBizSize = bizSnap.size;
          setStats((prev) => ({ ...prev, businesses: bizSnap.size }));
        });
      } catch (error) {
        console.error("Admin fetch error:", error);
        router.push("/profile");
      }
    });

    return () => {
      unsubscribe();
      if (usersUnsub) usersUnsub();
      if (expUnsub) expUnsub();
      if (bookUnsub) bookUnsub();
      if (bizUnsub) bizUnsub();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="admin" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-teal-700" size={28} />
          <div>
            <p className="text-sm font-semibold text-teal-700">Admin dashboard</p>
            <h1 className="mt-0.5 text-2xl font-bold">Platform Overview</h1>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Users" value={stats.users.toString()} detail="Registered accounts" icon={<Users size={21} />} />
          <StatCard label="Experiences" value={stats.experiences.toString()} detail="Listed on platform" icon={<CheckCircle2 size={21} />} />
          <StatCard label="Bookings" value={stats.bookings.toString()} detail="All time bookings" icon={<CalendarCheck size={21} />} />
          <StatCard label="Businesses" value={stats.businesses.toString()} detail="Host accounts" icon={<Shield size={21} />} />
        </div>

        {/* Recent registrations */}
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Recent Registrations</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">No users registered yet.</td>
                  </tr>
                ) : (
                  recentUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium">{u.name || "—"}</td>
                      <td className="text-slate-600">{u.email || "—"}</td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "Admin" ? "bg-purple-100 text-purple-700" :
                          u.role === "BusinessOwner" ? "bg-teal-100 text-teal-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                          {u.role || "Tourist"}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Platform health + admin notes */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Platform Health</h2>
            <ul className="mt-4 grid gap-2 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-100 py-2">
                <span>Total registered users</span>
                <span className="font-semibold text-slate-900">{stats.users}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 py-2">
                <span>Active businesses</span>
                <span className="font-semibold text-slate-900">{stats.businesses}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 py-2">
                <span>Listed experiences</span>
                <span className="font-semibold text-slate-900">{stats.experiences}</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Total bookings</span>
                <span className="font-semibold text-slate-900">{stats.bookings}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-800">Admin Notes</h2>
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-amber-700">
              <li>• Only users with role=&quot;Admin&quot; can access this panel.</li>
              <li>• To promote a user to Admin, update their role in Firestore directly.</li>
              <li>• Business accounts require role=&quot;BusinessOwner&quot;.</li>
              <li>• Traveler accounts use role=&quot;Tourist&quot;.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
