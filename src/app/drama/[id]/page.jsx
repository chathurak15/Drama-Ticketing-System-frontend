"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import ModernHeader from "../../../Components/modern/Header";
import ModernFooter from "../../../Components/modern/Footer";
import ModernShowCard from "../../../Components/modern/ShowCard";
import ShareModal from "../../../Components/common/ShareModal";
import {
  Star,
  Clock,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Share2,
  Users,
  Film,
  Play,
  TicketCheck,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getDramaById, getDramas, getRatings } from "../../../services/dramaService";
import { getShowsByDramaId } from "../../../services/ShowService";
import { getCdnUrl } from "../../../utils/cdn";
import { toast } from "react-toastify";
import {
  getPreviewDramaById,
  getPreviewDramas,
  getPreviewShowsByDramaId,
} from "../../../data/previewCatalog";

export default function DramaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [drama, setDrama] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [recommendedDramas, setRecommendedDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notFoundSearch, setNotFoundSearch] = useState("");

  const reviewsScrollRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchDramaData = async () => {
      try {
        setLoading(true);
        const previewDrama = getPreviewDramaById(id);
        if (previewDrama) {
          setDrama(previewDrama);
          setUpcomingShows(getPreviewShowsByDramaId(previewDrama.id));
          setRecommendedDramas(getPreviewDramas().filter((d) => d.id !== previewDrama.id));
          return;
        }

        // id can be a slug (e.g. "kelani-palama-a3f8b2") or numeric ID (e.g. "6")
        const dramaRes = await getDramaById(id);

        if (dramaRes?.data) {
          const loadedDrama = dramaRes.data;
          setDrama(loadedDrama);

          // Canonical slug sync in browser address bar (without full reload)
          if (
            loadedDrama.slug &&
            typeof window !== "undefined" &&
            !window.location.pathname.endsWith(`/${loadedDrama.slug}`)
          ) {
            window.history.replaceState(null, "", `/drama/${loadedDrama.slug}`);
          }

          // Fetch upcoming shows & reviews using the resolved numeric ID
          const [showsRes, revRes] = await Promise.allSettled([
            getShowsByDramaId({ page: 0, size: 8, dramaId: loadedDrama.id }),
            getRatings(0, 10, loadedDrama.id),
          ]);

          if (showsRes.status === "fulfilled" && showsRes.value?.data?.content) {
            const approvedOnly = showsRes.value.data.content.filter(
              (s) => s.status && (s.status.toLowerCase() === "approved" || s.status.toLowerCase() === "active")
            );
            setUpcomingShows(approvedOnly);
          }
          if (revRes.status === "fulfilled" && revRes.value?.data?.content) {
            setReviews(revRes.value.data.content);
          }
        } else {
          // If drama was not found, fetch recommended dramas to show user
          loadFallbackDramas();
        }
      } catch (err) {
        console.error("Failed to load drama details", err);
        loadFallbackDramas();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbackDramas = async () => {
      try {
        const res = await getDramas({ page: 0, size: 4, sortByRating: "desc" });
        if (res?.data?.content && res.data.content.length > 0) {
          setRecommendedDramas(res.data.content);
        } else {
          setRecommendedDramas(getPreviewDramas());
        }
      } catch (e) {
        setRecommendedDramas(getPreviewDramas());
      }
    };

    fetchDramaData();
  }, [id]);

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
      const match = url.match(youtubeRegex);
      return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch (err) {
      return null;
    }
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

  const scrollReviews = (dir) => {
    if (reviewsScrollRef.current) {
      const scrollAmt = dir === "left" ? -300 : 300;
      reviewsScrollRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const handleNotFoundSearchSubmit = (e) => {
    e.preventDefault();
    if (notFoundSearch.trim()) {
      router.push(`/dramas?search=${encodeURIComponent(notFoundSearch.trim())}`);
    }
  };

  if (loading) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading stage drama details...
            </p>
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  // Not Found State
  if (!drama) {
    return (
      <>
        <ModernHeader />
        <main className="min-h-screen bg-slate-50 dark:bg-[#0d0d12] py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-white dark:bg-[#14141e] p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl mb-12">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 font-['Plus_Jakarta_Sans']">
                Drama Not Found
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                We couldn't locate this drama production. It may have moved or its slug identifier might have been updated.
              </p>

              {/* Quick Search */}
              <form onSubmit={handleNotFoundSearchSubmit} className="max-w-md mx-auto flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Sri Lanka stage dramas..."
                    value={notFoundSearch}
                    onChange={(e) => setNotFoundSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-theatre-gold px-5 py-2.5 rounded-xl text-xs font-bold shrink-0"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/dramas"
                  className="btn-theatre-gold px-6 py-2.5 rounded-full text-xs font-bold shadow-md cursor-pointer"
                >
                  Browse All Dramas
                </Link>
                <Link
                  href="/shows"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition-colors"
                >
                  View Upcoming Shows
                </Link>
              </div>
            </div>

            {/* Suggested Top Dramas */}
            {recommendedDramas.length > 0 && (
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Popular Sri Lankan Stage Dramas You Might Like</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedDramas.map((rd) => (
                    <Link
                      key={rd.id}
                      href={`/drama/${rd.slug || rd.id}`}
                      className="group p-3 rounded-2xl bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-black mb-2">
                        <img
                          src={rd.image ? getCdnUrl(rd.image, "dramas") : "/assets/hero.png"}
                          alt={rd.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/hero.png";
                          }}
                        />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                        {rd.title}
                      </h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                        <span>View Drama</span>
                        <ArrowRight className="w-3 h-3" />
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <ModernFooter />
      </>
    );
  }

  const dramaPoster = drama.image
    ? getCdnUrl(drama.image, "dramas")
    : "/assets/hero.png";

  const trailerEmbed = convertToEmbedUrl(drama.videoUrl);

  const currentDramaSlug = drama.slug || drama.id;
  const canonicalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/drama/${currentDramaSlug}`
    : `https://naataka.lk/drama/${currentDramaSlug}`;

  // Structured Data (JSON-LD) for Search Engine Indexing (Google, Bing)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    "name": `${drama.title} - Sri Lanka Stage Drama`,
    "description": drama.description || `Official stage drama tickets and information for ${drama.title} on Naataka.lk`,
    "image": dramaPoster,
    "url": canonicalUrl,
    "inLanguage": "si-LK",
    "eventStatus": "https://schema.org/EventScheduled",
    "organizer": {
      "@type": "Organization",
      "name": "Naataka.lk",
      "url": "https://naataka.lk"
    },
    ...(drama.actors && drama.actors.length > 0 && {
      "performer": drama.actors.map((actor) => ({
        "@type": "Person",
        "name": actor.name,
        "jobTitle": actor.roleName || "Cast Member"
      }))
    }),
    ...(upcomingShows && upcomingShows.length > 0 && {
      "offers": upcomingShows.map((show) => ({
        "@type": "Offer",
        "name": show.title,
        "url": typeof window !== "undefined"
          ? `${window.location.origin}/show/${show.slug || show.showId}`
          : `https://naataka.lk/show/${show.slug || show.showId}`,
        "availability": "https://schema.org/InStock",
        "price": "1000",
        "priceCurrency": "LKR",
        "validFrom": new Date().toISOString()
      }))
    })
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-8 lg:py-12 transition-colors duration-200">
        <div className="desktop-container">
          {/* Breadcrumb Navigation & Share Button */}
          <div className="flex items-center justify-between gap-4 mb-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/dramas" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Dramas
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]">
                {drama.title}
              </span>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shadow-sm"
              title="Share this stage drama"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">Share</span>
            </button>
          </div>

          {/* Top Drama Showcase Card */}
          <div className="ticket-card bg-white dark:bg-[#14141e] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 shadow-xl mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Poster */}
              <div className="lg:col-span-5 relative aspect-[3/4] lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-black">
                <img
                  src={dramaPoster}
                  alt={`${drama.title} - Sri Lanka Stage Drama`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>

              {/* Information */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-[#12121a]">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300">
                      <TicketCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>වේදිකා නාට්‍යය • Official Production</span>
                    </span>
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{drama.rating ? Number(drama.rating).toFixed(1) : "4.8"} / 5.0</span>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] leading-tight mb-4">
                    {drama.title}
                  </h1>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-6 flex-wrap">
                    {Number(drama.duration) > 0 && formatDuration(drama.duration) && (
                      <>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          {formatDuration(drama.duration)}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span>Language: Sinhala / Bilingual</span>
                    <span>•</span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold">Official Sri Lanka Stage Play</span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">
                      Synopsis
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {drama.description || "A masterfully staged theatrical drama celebrated by audiences and critics across Sri Lanka."}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Available Dates</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {upcomingShows.length} Scheduled {upcomingShows.length === 1 ? "Show" : "Shows"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-amber-500" />
                      <span>Share</span>
                    </button>

                    <Link
                      href={`/shows?dramaId=${drama.id}`}
                      className="btn-theatre-gold flex-1 sm:flex-initial px-8 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Book Tickets for this Drama</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trailer Video Section */}
          {trailerEmbed && (
            <div className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Watch Trailer / Teaser</span>
              </h2>
              <div className="rounded-2xl overflow-hidden aspect-video max-w-4xl border border-slate-200 dark:border-white/10 shadow-lg bg-black">
                <iframe
                  src={trailerEmbed}
                  title={`${drama.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              </div>
            </div>
          )}

          {/* Cast & Artists Section */}
          {drama.actors && drama.actors.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Featured Cast & Artists</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {drama.actors.map((actor, idx) => {
                  const actorPhoto = actor.photo
                    ? getCdnUrl(actor.photo, "actors")
                    : "/assets/hero.png";

                  return (
                    <div
                      key={actor.id || idx}
                      className="ticket-card bg-white dark:bg-[#14141e] p-3 rounded-2xl text-center group border border-slate-200 dark:border-white/10 hover:border-amber-500/40 shadow-sm transition-all"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 border-2 border-slate-200 dark:border-white/10 group-hover:border-amber-400 transition-colors">
                        <img
                          src={actorPhoto}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/hero.png";
                          }}
                        />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {actor.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {actor.roleName || "Cast Member"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Shows for this drama */}
          {upcomingShows.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                    Shows for "{drama.title}"
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Book your seat for any upcoming performance
                  </p>
                </div>
                <Link
                  href={`/shows?dramaId=${drama.id}`}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                >
                  View All Shows →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {upcomingShows.map((show) => (
                  <ModernShowCard key={show.showId} show={show} />
                ))}
              </div>
            </div>
          )}

          {/* Audience Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Audience Reviews</span>
              </h2>

              {reviews.length > 3 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollReviews("left")}
                    className="p-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollReviews("right")}
                    className="p-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div
                ref={reviewsScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
              >
                {reviews.map((rev, idx) => (
                  <div
                    key={rev.id || idx}
                    className="ticket-card bg-white dark:bg-[#14141e] p-5 rounded-2xl min-w-[280px] max-w-[340px] shrink-0 border border-slate-200 dark:border-white/10 shadow-sm"
                  >
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (rev.ratingValue || rev.rating || 5)
                              ? "fill-amber-500 text-amber-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                      "{rev.comment || "An outstanding theatrical experience in Colombo. Acting was phenomenal!"}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/10">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rev.user ? `${rev.user.fname} ${rev.user.lname || ""}` : "Drama Enthusiast"}
                      </span>
                      <span>{rev.created ? new Date(rev.created).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#14141e] p-8 text-center rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Be among the first to experience this drama and leave a review!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={drama.title}
        text={`Watch ${drama.title} - Sri Lanka's official stage drama tickets on Naataka.lk! 🎭`}
        url={canonicalUrl}
        image={dramaPoster}
      />

      <ModernFooter />
    </>
  );
}
