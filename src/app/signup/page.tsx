"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("Tourist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phoneNumber,
        role: accountType,
        createdAt: new Date().toISOString(),
      });

      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google redirect result when user returns to this page
  useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              phoneNumber: user.phoneNumber || "",
              role: accountType,
              createdAt: new Date().toISOString(),
            });
          }
          router.push("/profile");
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Google redirect error:", err);
        setError("Google sign-in failed. Please try again or use email.");
        setLoading(false);
      });
  }, [router, accountType]);

  const handleGoogleSignup = () => {
    setError("");
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-700">
            Log in
          </Link>
        </>
      }
    >
      <div className="grid gap-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Account type
          <select 
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="Tourist">Traveler</option>
            <option value="BusinessOwner">Business host</option>
          </select>
        </label>

        <Button 
          type="button" 
          onClick={handleGoogleSignup} 
          disabled={loading} 
          variant="secondary" 
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-600 hover:text-teal-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
            <path fill="#FBBC05" d="M5.84 13.94c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V6.94H2.18A10.02 10.02 0 0 0 2 12c0 1.62.39 3.15 1.09 4.5l3.75-2.56Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.5l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
          </svg>
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-2">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="grid gap-4">
        <FormField 
          label="Full name" 
          placeholder="Your name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <FormField 
          label="Email" 
          type="email" 
          placeholder="you@example.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <FormField 
          label="Phone number" 
          type="tel" 
          placeholder="+254..." 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
        />
        <FormField 
          label="Password" 
          type="password" 
          placeholder="Create a password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <FormField 
          label="Confirm Password" 
          type="password" 
          placeholder="Confirm your password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          <UserPlus size={18} />
          {loading ? "Signing up..." : "Sign up with Email"}
        </Button>
      </form>
    </div>
    </AuthCard>
  );
}
