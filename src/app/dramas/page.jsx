"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  Search,
  Star,
  Clock,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Film,
  Ticket,
} from "lucide-react";
import { getDramas } from "../../services/dramaService";
import { getCdnUrl } from "../../utils/cdn";
import { getPreviewDramas, isPreviewMode } from "../../data/previewCatalog";

const ITEMS_PER_PAGE = 12;

export default function DramasPage() {
  const [dramas, setDramas] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDramasData = async () => {
      try {
        setLoading(true);
        if (isPreviewMode()) {
          setDramas(getPreviewDramas(search));
          setTotalPages(1);
          return;
        }
        const res = await getDramas({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          title: search,
        });

        if (res?.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
          setDramas(res.data.content);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setDramas(getPreviewDramas(search));
          setTotalPages(1);
        }
      } catch (err) {
        console.warn("Error fetching dramas, using sample dramas", err);
        setDramas(getPreviewDramas(search));
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchDramasData();
  }, [currentPage, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const formatDuration = (minutes) => {
    const num = Number(minutes);
    if (!num || num <= 0) return null;
    const h = Math.floor(num / 60);
    const m = num % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
        <div className="desktop-container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 text-xs font-semibold mb-2">
                <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>වේදිකා නාට්‍ය එකතුව • National Stage Repertory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Stage Dramas & Theatrical Works
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Explore iconic Sri Lankan theatre plays, cast profiles, and book tickets for upcoming show dates.
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="max-w-md w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dramas by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full bg-white dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
              />
            </form>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="ticket-card aspect-[3/4] rounded-2xl animate-pulse bg-slate-200 dark:bg-white/5"
                />
              ))}
            </div>
          ) : dramas.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {dramas.map((drama) => {
                  const dramaImg = drama.image
                    ? getCdnUrl(drama.image, "dramas")
                    : "/assets/hero.png";

                  return (
                    <Link
                      key={drama.id}
                      href={`/drama/${drama.slug || drama.id}`}
                      className="group ticket-card overflow-hidden rounded-2xl flex flex-col h-full border border-slate-200 dark:border-white/10 hover:border-amber-500/50 bg-white dark:bg-[#111119] shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-black">
                        <img
                          src={dramaImg}
                          alt={drama.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/hero.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                        {drama.rating && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-amber-400 text-xs font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{Number(drama.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white dark:bg-[#111119]">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans']">
                            {drama.title}
                          </h3>

                          {Number(drama.duration) > 0 && formatDuration(drama.duration) && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>{formatDuration(drama.duration)}</span>
                            </div>
                          )}

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                            {drama.description || "A celebrated theatrical production by acclaimed Sri Lankan dramatists."}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">View Details</span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                            Explore Shows →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page <span className="text-amber-600 dark:text-amber-400 font-bold">{currentPage + 1}</span> of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-[#14141e] p-14 text-center rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg mx-auto shadow-md">
              <Film className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-70" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No dramas found</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Try searching with a different keyword or reset your search.
              </p>
              <button
                onClick={() => setSearch("")}
                className="btn-theatre-gold px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer shadow-md"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </main>

      <ModernFooter />
    </>
  );
}
