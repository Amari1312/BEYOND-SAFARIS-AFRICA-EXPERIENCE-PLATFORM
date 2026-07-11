"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { ExperienceCard } from "./experience-card";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const q = query(collection(db, "experiences"));
      const querySnapshot = await getDocs(q);
      
      const searchLower = searchTerm.toLowerCase();
      const filtered = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((exp: any) => 
          exp.title?.toLowerCase().includes(searchLower) ||
          exp.location?.toLowerCase().includes(searchLower) ||
          exp.category?.toLowerCase().includes(searchLower)
        );
        
      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white rounded-full p-2 shadow-lg max-w-2xl mx-auto relative z-10">
        <div className="flex-1 flex items-center px-4">
          <Search className="text-slate-400 mr-2" size={20} />
          <input
            type="text"
            placeholder="Search experiences by location, category, or title..."
            className="w-full text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-[#006400] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005000] transition-colors disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {hasSearched && (
        <div className="mt-16 relative z-10 bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-slate-100 min-h-[400px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Search Results</h2>
          {loading ? (
            <div className="text-center text-slate-500 py-12">Loading...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((exp) => (
                <ExperienceCard key={exp.id} {...exp} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">No experiences found matching "{searchTerm}".</div>
          )}
        </div>
      )}
    </div>
  );
}
