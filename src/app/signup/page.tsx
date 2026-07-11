"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Create Firestore user document
      await setDoc(doc(db, "users", uid), {
        userId: uid,
        fullName,
        email,
        role: accountType === "Business host" ? "businessOwner" : "user",
        createdAt: new Date(),
      });

      // Redirect to profile
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
      <form onSubmit={handleSubmit} className="grid gap-4">
        <FormField
          label="Full name"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Account type
          <select
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="user">Traveler</option>
            <option value="businessOwner">Business host</option>
          </select>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          <UserPlus size={18} />
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
