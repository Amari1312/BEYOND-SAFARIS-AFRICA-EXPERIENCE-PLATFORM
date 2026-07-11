"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ExperienceCard } from "@/components/experience-card";
import { getExperiences } from "@/utils/firebase-data";
import type { Experience } from "@/types";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const data = await getExperiences();
      setExperiences(data);
      setLoading(false);
    };
    fetchExperiences();
  }, []);

  return (
    <div className="min-h-screen border-t border-green-500 bg-stone-50 ">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl content-justify-center">
            <h1 className="mt-2 text-4xl font-bold text-slate-950  text-center">Experiences in Africa</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Curated stays, guided excursions, and cultural adventures built around real local hosts.
            </p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-green-600 hover:text-green-800">
            Browse events →
          </Link>
        </div>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">Loading experiences...</p>
            </div>
          ) : experiences.length > 0 ? (
            experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No experiences available yet</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
