"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModernHeader from "../Components/modern/Header";
import ModernFooter from "../Components/modern/Footer";
import ModernShowCard from "../Components/modern/ShowCard";
import {
  Search,
  MapPin,
  Calendar,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Users,
  Building,
  CheckCircle2,
  ArrowRight,
  Landmark,
  TicketCheck,
  Clock,
  Compass,
  Star,
} from "lucide-react";
import { getShows } from "../services/ShowService";
import { getDramas } from "../services/dramaService";
import { getCdnUrl } from "../utils/cdn";
import usePlatformConfig from "../hooks/usePlatformConfig";
import { getPreviewShows, getPreviewDramas, isPreviewMode } from "../data/previewCatalog";

const SRI_LANKAN_VENUES = [
  {
    name: "Lionel Wendt Memorial Theatre",
    sinhala: "ලයනල් වෙන්ඩ්ට් රඟහල",
    city: "Guildford Crescent, Colombo 07",
    capacity: "600 Premium Seats",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    tag: "Historic Proscenium Stage",
    features: "Central A/C • Orchestra Pit • Gallery",
  },
  {
    name: "Nelum Pokuna Mahinda Rajapaksa Theatre",
    sinhala: "නෙළුම් පොකුණ රඟහල",
    city: "Ananda Coomaraswamy Mawatha, Colombo 07",
    capacity: "1,288 Tiered Seats",
    image: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80",
    tag: "Modern Grand Auditorium",
    features: "State-of-the-Art Acoustics • Multi-Tier Seating",
  },
  {
    name: "Elphinstone Theatre",
    sinhala: "එල්ෆින්ස්ටන් රඟහල",
    city: "Maradana, Colombo 10",
    capacity: "850 Reserved Seats",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    tag: "Centennial Heritage",
    features: "Historic Balcony • Modern Digital Sound",
  },
  {
    name: "Sarachchandra Open Air Theatre",
    sinhala: "මහාචාර්ය එදිරිවීර සරච්චන්ද්‍ර එළිමහන් රඟහල",
    city: "Peradeniya, Kandy",
    capacity: "1,500 Amphitheatre Seats",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
    tag: "Iconic Amphitheatre",
    features: "Natural Acoustic Slope • Wala Cultural Stage",
  },
];

const SRI_LANKAN_CITIES = [
  "All Sri Lanka",
  "Colombo",
  "Kandy",
  "Galle",
  "Gampaha",
  "Negombo",
  "Kurunegala",
  "Anuradhapura",
];

const FILTER_PILLS = [
  { id: "all", label: "All Productions", city: null },
  { id: "colombo", label: "Colombo Stages", city: "Colombo" },
  { id: "kandy", label: "Kandy & Central", city: "Kandy" },
  { id: "galle", label: "Galle & South", city: "Galle" },
  { id: "gampaha", label: "Gampaha", city: "Gampaha" },
  { id: "negombo", label: "Negombo", city: "Negombo" },
];

const FALLBACK_SHOWS = getPreviewShows();
const FALLBACK_DRAMAS = getPreviewDramas();

export default function HomePage() {
  const router = useRouter();
  const { payhereReviewMode } = usePlatformConfig();

  const [shows, setShows] = useState(FALLBACK_SHOWS);
  const [dramas, setDramas] = useState(FALLBACK_DRAMAS);
  const [loading, setLoading] = useState(false);

  // Search console state
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCity, setSearchCity] = useState("All Sri Lanka");
  const [searchDate, setSearchDate] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        if (isPreviewMode()) {
          const previewList = getPreviewShows();
          setShows(previewList);
          setDramas(previewList.map(s => s.drama));
          return;
        }

        const [showsRes, dramasRes] = await Promise.all([
          getShows({ page: 0, size: 8 }),
          getDramas({ page: 0, size: 6 }),
        ]);

        if (!isMounted) return;

        if (showsRes?.data?.content) {
          const approvedOnly = showsRes.data.content.filter(
            (s) => s.status && (s.status.toLowerCase() === "approved" || s.status.toLowerCase() === "active")
          );
          if (approvedOnly.length > 0) {
            setShows(approvedOnly);
          } else {
            setShows(FALLBACK_SHOWS);
          }
        }
        if (dramasRes?.data?.content && dramasRes.data.content.length > 0) {
          setDramas(dramasRes.data.content);
        } else {
          setDramas(FALLBACK_DRAMAS);
        }
      } catch (err) {
        console.error("Failed to load home data, using curated repertoire shows", err);
        if (isMounted) {
          setShows(FALLBACK_SHOWS);
          setDramas(FALLBACK_DRAMAS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle.trim()) params.append("title", searchTitle.trim());
    if (searchCity && searchCity !== "All Sri Lanka") params.append("city", searchCity);
    if (searchDate) params.append("date", searchDate);
    router.push(`/shows?${params.toString()}`);
  };

  const handlePillFilter = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  const displayedShows = selectedFilter === "all"
    ? shows
    : shows.filter((s) => {
        const pill = FILTER_PILLS.find((p) => p.id === selectedFilter);
        if (!pill || !pill.city) return true;
        const cName = (s.city?.cityName || (typeof s.city === "string" ? s.city : "") || "").toLowerCase();
        const loc = (s.location || "").toLowerCase();
        const target = pill.city.toLowerCase();
        return cName.includes(target) || loc.includes(target);
      });

  const spotlightShow = shows.length > 0 ? shows[0] : null;

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0b0b10] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* ============================================================ */}
        {/* HERO SECTION - Theatrical Proscenium Spotlight Banner       */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200 dark:border-white/[0.06] bg-gradient-to-b from-[#fff5f2] via-[#faf5f0] to-slate-50 dark:from-[#240b0b] dark:via-[#100910] dark:to-[#0b0b10]">
          {/* Subtle Stage Lighting Accents */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-rose-500/10 dark:bg-[#661F19]/25 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="desktop-container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Direct Box Office Console */}
              <div className="lg:col-span-7 text-left">
                {/* Official Accreditation Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/25 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 text-xs font-semibold mb-5 shadow-sm">
                  <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>ශ්‍රී ලංකා වේදිකා නාට්‍ය ප්‍රවේශපත් • Official Stage Box Office</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans'] mb-4">
                  Direct Box Office Seats for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-200 dark:to-amber-500">
                    Sri Lanka’s Stage Dramas
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mb-8 leading-relaxed font-normal">
                  Reserve verified seating directly for acclaimed productions at Lionel Wendt, Nelum Pokuna, Elphinstone and provincial theatres. Instant secure card checkout and digital admission.
                </p>

                {/* Eventure.lk Search Console */}
                <div className="bg-white/95 dark:bg-[#14141e]/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/60 dark:shadow-2xl mb-6">
                  <form
                    onSubmit={handleHeroSearch}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Drama or Actor Input */}
                    <div className="sm:col-span-5 relative text-left">
                      <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400/90 uppercase tracking-wider block mb-1 pl-1">
                        Drama or Production
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Suba Saha Yasa, Guru Tharu..."
                          value={searchTitle}
                          onChange={(e) => setSearchTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#1c1c28] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#1c1c28] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* City / Venue Select */}
                    <div className="sm:col-span-4 relative text-left">
                      <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400/90 uppercase tracking-wider block mb-1 pl-1">
                        Location / City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#1c1c28] text-xs sm:text-sm text-slate-900 dark:text-white pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#1c1c28] focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer transition-all"
                        >
                          {SRI_LANKAN_CITIES.map((c) => (
                            <option key={c} value={c} className="bg-white dark:bg-[#151520] text-slate-900 dark:text-white">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date Picker & Search Button */}
                    <div className="sm:col-span-3 flex items-end">
                      <button
                        type="submit"
                        className="btn-theatre-gold w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                      >
                        <Search className="w-4 h-4" />
                        <span>Find Seats</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Trust Elements Bar */}
                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>CBSL-Approved IPG Protected</span>
                  </span>
                  <span className="text-slate-300 dark:text-white/20">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <TicketCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Verified Gate E-Ticket</span>
                  </span>
                  <span className="text-slate-300 dark:text-white/20">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>10-Minute Real-Time Hold</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Featured Production Spotlight Card */}
              <div className="lg:col-span-5">
                {spotlightShow ? (
                  <div className="ticket-card bg-white dark:bg-[#151520] border border-slate-200 dark:border-amber-500/30 p-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block"></span>
                        <span>FEATURED PRODUCTION</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                        Direct Allocation
                      </span>
                    </div>

                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-black">
                      <img
                        src={
                          spotlightShow.image
                            ? getCdnUrl(spotlightShow.image, "shows")
                            : "/assets/hero.png"
                        }
                        alt={spotlightShow.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/hero.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <span className="px-2 py-0.5 rounded bg-[#661F19] text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                          {spotlightShow.location || "Lionel Wendt Theatre"}
                        </span>
                        <h3 className="text-lg font-bold text-white line-clamp-1">
                          {spotlightShow.title}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-left">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                        <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Date & Time</span>
                        <span className="text-slate-900 dark:text-white font-bold">{spotlightShow.showDate || "This Weekend"}</span>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-semibold">{spotlightShow.showTime || "06:30 PM"}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                        <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Admission</span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold font-mono text-sm">
                          From LKR {(spotlightShow.startingPrice || spotlightShow.minPrice || 750).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Balcony & ODC</span>
                      </div>
                    </div>

                    <Link
                      href={`/show/${spotlightShow.slug || spotlightShow.showId}`}
                      className="btn-theatre-maroon w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 !text-white shadow-md hover:opacity-95 transition-opacity"
                    >
                      <Ticket className="w-4 h-4 text-white" />
                      <span className="text-white">Book Tickets</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                ) : (
                  <div className="ticket-card bg-white dark:bg-[#151520] border border-slate-200 dark:border-white/10 p-6 text-center text-slate-500 dark:text-slate-400 text-xs shadow-md">
                    <Ticket className="w-10 h-10 text-amber-500 dark:text-amber-400 mx-auto mb-3 opacity-80" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Official Box Office Active</p>
                    <p className="mt-1">Browse our current theatrical repertoire below.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CURATED REPERTOIRE TABS (Eventure.lk style, Clean Light Bar) */}
        {/* ============================================================ */}
        <section className="py-3.5 border-b border-slate-200 dark:border-white/[0.06] bg-white/95 dark:bg-[#0f0f16] sticky top-[61px] z-40 backdrop-blur-md shadow-sm dark:shadow-none">
          <div className="desktop-container">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5 text-[11px]">
                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Filter Repertoire:</span>
              </span>
              {FILTER_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handlePillFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-lg shrink-0 font-medium transition-all text-xs cursor-pointer ${
                    selectedFilter === pill.id
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-transparent"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
              <Link
                href="/dramas"
                className="px-3.5 py-1.5 rounded-lg shrink-0 font-medium bg-slate-100 dark:bg-white/[0.05] text-amber-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/70 dark:border-transparent ml-auto flex items-center gap-1 text-xs"
              >
                <span>Full Drama Repertory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* UPCOMING SHOWS - Eventure.lk Physical Ticket Grid            */}
        {/* ============================================================ */}
        <section id="upcoming-shows" className="pt-6 pb-12 sm:pt-8 sm:pb-16 bg-slate-50 dark:bg-[#0b0b10]">
          <div className="desktop-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                  <TicketCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>දැන් තිරගත වන වේදිකා නාට්‍ය • Live Theatrical Schedule</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Featured Shows & Stage Performances
                </h2>
              </div>

              <Link
                href="/shows"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors self-start sm:self-auto"
              >
                <span>Complete Performance Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ticket-card aspect-[3/4] rounded-2xl animate-pulse bg-slate-200 dark:bg-white/5" />
                ))}
              </div>
            ) : displayedShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedShows.map((show) => (
                  <ModernShowCard key={show.showId} show={show} />
                ))}
              </div>
            ) : (
              <div className="ticket-card p-8 sm:p-10 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-[#12121b] border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl max-w-xl mx-auto">
                <Ticket className="w-10 h-10 text-amber-500/80 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No Performances Scheduled in this Region
                </h3>
                <p className="text-xs mb-4 text-slate-500 dark:text-slate-400">
                  Switch to All Productions or explore all Sri Lankan dates in our full calendar.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedFilter("all")}
                    className="btn-theatre-gold text-xs px-4 py-2 rounded-lg font-bold"
                  >
                    All Productions
                  </button>
                  <Link
                    href="/shows"
                    className="btn-theatre-maroon text-xs px-4 py-2 rounded-lg font-bold !text-white"
                  >
                    View All Shows
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* ACCLAIMED DRAMAS - Sri Lankan Theatrical Productions Catalog */}
        {/* ============================================================ */}
        <section className="py-14 bg-white dark:bg-gradient-to-b dark:from-[#111119] dark:to-[#0b0b10] border-y border-slate-200 dark:border-white/[0.06]">
          <div className="desktop-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-1.5">
                  සම්මානනීය වේදිකා නාට්‍ය • Repertoire
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Acclaimed Sri Lankan Stage Plays
                </h2>
              </div>

              <Link
                href="/dramas"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors self-start sm:self-auto"
              >
                <span>Explore Full Repertory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dramas.slice(0, 6).map((drama) => {
                const dramaImg = drama.image
                  ? getCdnUrl(drama.image, "dramas")
                  : "/assets/hero.png";

                return (
                  <Link
                    key={drama.id}
                    href={`/drama/${drama.slug || drama.id}`}
                    className="ticket-card group p-3.5 flex gap-4 bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 hover:border-amber-500/40 hover:shadow-xl transition-all text-left"
                  >
                    <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-black relative border border-slate-200 dark:border-white/10">
                      <img
                        src={dramaImg}
                        alt={drama.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/hero.png";
                        }}
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{drama.rating ? Number(drama.rating).toFixed(1) : "4.8"}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-normal">/ 5.0</span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans']">
                          {drama.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {drama.description || "Acclaimed Sri Lankan theatrical production."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                        <span className="text-[11px]">
                          {Number(drama.duration) > 0
                            ? `${Math.floor(Number(drama.duration) / 60) > 0 ? `${Math.floor(Number(drama.duration) / 60)}h ` : ""}${Number(drama.duration) % 60 > 0 ? `${Number(drama.duration) % 60}m` : ""}`.trim()
                            : "Live Stage"}
                        </span>
                        <span className="text-amber-700 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                          <span>Production Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SRI LANKA ICONIC THEATRES & VENUES                           */}
        {/* ============================================================ */}
        <section className="py-16 bg-slate-50 dark:bg-transparent">
          <div className="desktop-container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-2">
                ප්‍රමුඛතම රංග භූමි • Legendary Auditoriums
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
                Sri Lanka's Historic Theatres
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Experience world-class acoustics, intimate seating sightlines, and rich theatrical heritage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SRI_LANKAN_VENUES.map((venue, idx) => (
                <div
                  key={idx}
                  className="ticket-card rounded-xl overflow-hidden group border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#13131c] shadow-sm hover:shadow-xl"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/85 backdrop-blur-md text-amber-300 border border-white/10">
                      {venue.tag}
                    </span>
                  </div>
                  <div className="p-4 text-left">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {venue.name}
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mb-2">{venue.sinhala}</p>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate">{venue.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>{venue.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* HOW TO BOOK - Box Office Steps                               */}
        {/* ============================================================ */}
        <section className="pt-12 pb-10 sm:pt-14 sm:pb-12 bg-white dark:bg-[#0f0f17] border-t border-slate-200 dark:border-white/[0.06]">
          <div className="desktop-container">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-2">
                Verified Direct Booking
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                How to Book in 4 Simple Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Select Show & Theatre",
                  desc: "Browse our active repertoire, select your date, showtime, and auditorium venue.",
                  icon: Calendar,
                },
                {
                  step: "02",
                  title: "Choose Exact Seats",
                  desc: "Interact with the real-time seating chart to select ODC, Balcony, or Box seats.",
                  icon: Users,
                },
                {
                  step: "03",
                  title: "Pay Securely by Card",
                  desc: "Complete transaction in LKR via Visa, Mastercard, or American Express with 3D Secure protection.",
                  icon: ShieldCheck,
                },
                {
                  step: "04",
                  title: "Instant Gate E-Ticket",
                  desc: "Receive encrypted QR ticket via SMS and WhatsApp. Show at the entrance and enjoy.",
                  icon: TicketCheck,
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="ticket-card p-6 relative border border-slate-200 dark:border-white/[0.08] hover:border-amber-500/40 hover:shadow-lg transition-all text-left bg-slate-50/70 dark:bg-[#13131c]"
                  >
                    <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-[#661F19]/40 border border-rose-200 dark:border-[#661F19] flex items-center justify-center text-[#661F19] dark:text-amber-400 mb-4">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-200 dark:text-white/10 absolute top-5 right-5 font-mono select-none">
                      {item.step}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-['Plus_Jakarta_Sans']">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pt-2 pb-14 sm:pb-16">
          <div className="desktop-container">
            {payhereReviewMode ? (
              <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-r from-[#661F19] via-[#4A1410] to-[#2B0B08] border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-left text-white">
                <div className="max-w-xl z-10">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3 inline-block">
                    Official Sri Lankan Theatre Box Office
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mb-3">
                    Reserve Your Seat for Live Stage Dramas Across Sri Lanka
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    Interactive 2D & 3D auditorium seat selection, instant QR e-tickets, and verified box-office pricing.
                  </p>
                </div>

                <div className="shrink-0 z-10 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const el = document.getElementById("upcoming-shows");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      } else {
                        router.push("/shows");
                      }
                    }}
                    className="btn-theatre-gold px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-center shadow-lg w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Explore Upcoming Shows</span>
                    <ChevronRight className="w-4 h-4 opacity-75" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-r from-[#661F19] via-[#4A1410] to-[#2B0B08] border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-left text-white">
                <div className="max-w-xl z-10">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3 inline-block">
                    For Sri Lankan Drama Producers & Theatres
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mb-3">
                    Sell Out Your Next Production on Naataka.lk
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    Join Sri Lanka's dedicated stage drama network. Manage reserved seating, direct bank settlements, QR scanning apps for gate staff, and audience promotion across all 9 provinces.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 z-10 w-full sm:w-auto">
                  <Link
                    href="/register"
                    className="btn-theatre-gold px-6 py-3 rounded-lg text-xs sm:text-sm font-bold text-center shadow-lg"
                  >
                    Register as Organizer
                  </Link>
                  <Link
                    href="/contact"
                    className="px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/30 text-center transition-colors"
                  >
                    Contact Box Office
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <ModernFooter />
    </>
  );
}
