"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import ModernShowCard from "../../Components/modern/ShowCard";
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  TicketCheck,
} from "lucide-react";
import { getShows, getCity } from "../../services/ShowService";
import { getPreviewShows, PREVIEW_CITIES, isPreviewMode } from "../../data/previewCatalog";

const ITEMS_PER_PAGE = 12;

function ShowsContent() {
  const searchParams = useSearchParams();

  const [cities, setCities] = useState([]);
  const [shows, setShows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    title: searchParams.get("title") || "",
    city: searchParams.get("city") || "",
    date: searchParams.get("date") || "",
    venue: searchParams.get("venue") || "",
    dramaId: searchParams.get("dramaId") || null,
  });

  useEffect(() => {
    // Fetch cities for dropdown
    const loadCities = async () => {
      try {
        if (isPreviewMode()) {
          setCities(PREVIEW_CITIES);
          return;
        }
        const res = await getCity();
        if (Array.isArray(res) && res.length > 0) {
          setCities(res);
        } else {
          setCities(PREVIEW_CITIES);
        }
      } catch (err) {
        console.warn("Failed to load cities, using sample cities", err);
        setCities(PREVIEW_CITIES);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    // Update filters if searchParams changed
    setFilters((prev) => ({
      ...prev,
      title: searchParams.get("title") || "",
      city: searchParams.get("city") || "",
      date: searchParams.get("date") || "",
      venue: searchParams.get("venue") || "",
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchShowsData = async () => {
      try {
        setLoading(true);

        if (isPreviewMode()) {
          const previewList = getPreviewShows(filters);
          setShows(previewList);
          setTotalPages(1);
          return;
        }

        const res = await getShows({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          title: filters.title,
          city: filters.city,
          date: filters.date,
          venue: filters.venue,
          dramaId: filters.dramaId,
        });

        if (res?.data) {
          const raw = res.data.content || [];
          const approvedOnly = raw.filter(
            (s) => s.status && (s.status.toLowerCase() === "approved" || s.status.toLowerCase() === "active")
          );
          if (approvedOnly.length > 0) {
            setShows(approvedOnly);
            setTotalPages(res.data.totalPages || 1);
          } else {
            setShows(getPreviewShows(filters));
            setTotalPages(1);
          }
        } else {
          setShows(getPreviewShows(filters));
          setTotalPages(1);
        }
      } catch (err) {
        console.warn("Error fetching shows, falling back to sample shows", err);
        setShows(getPreviewShows(filters));
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsData();
  }, [currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      title: "",
      city: "",
      date: "",
      venue: "",
      dramaId: null,
    });
    setCurrentPage(0);
  };

  const hasActiveFilters =
    filters.title || filters.city || filters.date || filters.venue;

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
        <div className="desktop-container">
          {/* Header Title & Subtitle */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 text-xs font-semibold mb-2">
              <TicketCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>වේදිකා දර්ශන වාර • Live Stage Schedule</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Upcoming Shows in Sri Lanka
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select your show, review auditorium seating, and book verified tickets instantly.
            </p>
          </div>

          {/* Interactive Filter Bar */}
          <div className="bg-white/95 dark:bg-[#14141e]/90 p-4 rounded-2xl mb-10 shadow-lg dark:shadow-xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by show title..."
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none transition-all"
                />
              </div>

              {/* City selector */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="">All Cities (Island-wide)</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                  {cities.map((c) => (
                    <option key={c.id || c.cityId} value={c.cityName}>
                      {c.cityName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date selector */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-slate-200 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none cursor-pointer transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 ml-auto">
                  {shows.length} shows found
                </div>
              </div>
            </div>
          </div>

          {/* Shows Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="ticket-card aspect-[3/4] rounded-2xl animate-pulse bg-slate-200 dark:bg-white/5"
                />
              ))}
            </div>
          ) : shows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {shows.map((show) => (
                  <ModernShowCard key={show.showId} show={show} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page <span className="text-amber-600 dark:text-amber-400 font-bold">{currentPage + 1}</span> of{" "}
                    {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-[#14141e] p-14 text-center rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg mx-auto shadow-md">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No shows match your search</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Try searching for another city, drama name, or clear your filters to view all scheduled stage drama performances.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-theatre-gold px-6 py-2.5 rounded-full text-xs font-bold shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <ModernFooter />
    </>
  );
}

export default function ShowsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ShowsContent />
    </Suspense>
  );
}
