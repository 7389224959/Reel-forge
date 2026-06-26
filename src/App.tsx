import React, { useState } from "react";
import { Sparkles, Loader2, Play } from "lucide-react";
import { ReelData } from "./types";
import { ReelDisplay } from "./components/ReelDisplay";

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reelData, setReelData] = useState<ReelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReelData(null);

    try {
      const response = await fetch("/api/generate-reel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate reel");
      }

      const data: ReelData = await response.json();
      setReelData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ReelForge</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
            Turn news into viral reels.
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Enter a news topic or draft. We'll search for the facts, write an engaging script, and suggest the perfect B-roll.
          </p>

          {/* Form */}
          <form onSubmit={handleGenerate} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., SpaceX latest launch or AI breakthrough..."
              className="flex-1 px-4 py-3 sm:py-0 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Script
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {reelData && <ReelDisplay data={reelData} />}
      </main>
    </div>
  );
}
