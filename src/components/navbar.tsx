"use client";

import Link from "next/link";
import { Heart, Menu, Search, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "@/utils/firebase";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type NavbarProps = {
  variant?: "default" | "admin";
  profileHref?: string;
};

export function Navbar({ variant = "default", profileHref }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(variant === "admin");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "Admin") {
          setIsAdmin(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/experiences?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const links = isAdmin
    ? [
        { href: "/admin", label: "Overview" },
      ]
    : [
        { href: user ? "/profile" : "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/experiences", label: "Experiences" },
        { href: "/events", label: "Events" },
        { href: "/plan", label: "Plan" },
        { href: "/contact", label: "Contact" },
      ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-stone-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={user ? (isAdmin ? "/admin" : "/profile") : "/"} className="flex items-center gap-2 font-bold text-slate-950">
          <Image src="/logos/logo.jpg" alt="Beyond Safari Logo" width={40} height={40} className="rounded-lg" />
          {isAdmin ? <span className="text-sm uppercase tracking-[0.25em] text-teal-700">Admin</span> : null}
        </Link>
        <nav className="ml-6 hidden items-center gap-5 text-md font-bold text-slate-950 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isAdmin ? (
            <>
              <form onSubmit={handleSearch} className="hidden w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 lg:flex">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search destinations" 
                  className="bg-transparent outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Link
                href="/user/profile"
                className="hidden rounded-lg p-2 text-slate-950 hover:bg-green-100 md:block"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            </>
          ) : null}
          <Link
            href={user ? (isAdmin ? "/admin" : profileHref ?? "/profile") : "/login"}
            className="rounded-lg p-2 text-slate-950 hover:bg-green-100"
            aria-label="Profile"
          >
            <User size={26} />
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-950 hover:bg-red-100 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={26} className="text-red-600" />
            </button>
          )}
        </div>

        <button className="rounded-lg p-2 text-slate-950 hover:bg-green-100 md:hidden" aria-label="Menu">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
