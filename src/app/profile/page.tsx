"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "Admin") {
            router.push("/admin");
          } else if (userData.role === "BusinessOwner") {
            router.push("/business");
          } else {
            router.push("/user/profile");
          }
        } else {
          // If no user doc exists, default to traveler
          router.push("/user/profile");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        router.push("/user/profile");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
