"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getEvents } from "@/utils/firebase-data";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen border-t border-green-500 bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Upcoming</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Events worth planning around</h1>
          <p className="mt-3 text-lg text-slate-600">
            From sunset bonfires to artisan fairs, these are community-driven gatherings you can book into.
          </p>
        </div>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-4/3">
                  {event.image && <Image src={event.image} alt={event.title} fill className="object-cover" />}
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-teal-700">{event.date}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{event.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                  <p className="mt-4 text-sm font-medium text-slate-700">{event.location}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No events available yet</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
