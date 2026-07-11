"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Tourist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

  return (
    <AuthCard
      title="Create your account"
      subtitle="Choose traveler or business access after signup; the frontend is ready for Firebase auth roles."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="grid gap-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
        />
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
        <Button type="submit" disabled={loading} className="w-full">
          <UserPlus size={18} />
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
