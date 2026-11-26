"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Theater,
  Upload,
  FileText,
  Armchair,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Plus,
  X,
  DoorOpen,
  ShieldCheck,
  Tag,
  Layers,
  Info,
  Check,
} from "lucide-react";
import { getCity } from "../../../services/ShowService";
import {
  getTheatresByUserId,
  getSeatTypesByTheatreId,
} from "../../../services/TheatreService";
import { getDramas } from "../../../services/dramaService";
import { useAuth } from "../../../utils/AuthContext";
import { uploadFile } from "../../../services/FileService.Js";
import { getCdnUrl } from "../../../utils/cdn";
import notify from "../../../utils/notify";

const ShowForm = forwardRef(({ formData, setFormData }, ref) => {
  const [cities, setCities] = useState([]);
  const [dramas, setDramas] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDramas, setIsLoadingDramas] = useState(false);
  const [isLoadingTheatres, setIsLoadingTheatres] = useState(false);
  const [isLoadingSeatTypes, setIsLoadingSeatTypes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Seating Mode: "reserved" (Hall layout seat map) vs "general" (Open grounds / Quantity tickets)
  const [seatingMode, setSeatingMode] = useState("reserved");

  // Multi-showtime slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeInput, setNewTimeInput] = useState("");

  // General admission ticket tiers
  const [generalTiers, setGeneralTiers] = useState([
    { tierName: "Standard Admission", price: 1000, capacity: 200 },
    { tierName: "VIP / Front Area", price: 2500, capacity: 50 },
  ]);

  const userId = useAuth().user?.id;

  // Initialize form data & parse existing timeslots
  useEffect(() => {
    if (!formData.temporaryTheatre) {
      setFormData((prev) => ({
        ...prev,
        temporaryTheatre: null,
        userId: prev.userId || userId,
        pricing: prev.pricing || [],
      }));
    }
  }, [formData.temporaryTheatre, setFormData, userId]);

  // Handle initial timeslots from formData
  useEffect(() => {
    if (formData.showTimes && typeof formData.showTimes === "string") {
      const parsed = formData.showTimes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (parsed.length > 0) {
        setTimeSlots(parsed);
        return;
      }
    }
    if (formData.showTime && (!timeSlots || timeSlots.length === 0)) {
      setTimeSlots([formData.showTime]);
    }
  }, [formData.showTimes, formData.showTime]);

  // Sync seatingMode if editing
  useEffect(() => {
    if (formData.theaterId || formData.theatre?.id) {
      setSeatingMode("reserved");
    } else if (formData.showId && !formData.theaterId && !formData.theatre?.id) {
      setSeatingMode("general");
    }
  }, [formData.theaterId, formData.theatre, formData.showId]);

  // Populate generalTiers from existing pricing if editing open venue show
  useEffect(() => {
    if (
      (!formData.theaterId && !formData.theatre?.id) &&
      Array.isArray(formData.pricing) &&
      formData.pricing.length > 0
    ) {
      const parsedTiers = formData.pricing.map((p, idx) => ({
        tierName: p.tierName || (idx === 0 ? "Standard Admission" : idx === 1 ? "VIP / Front Area" : `Tier ${idx + 1}`),
        price: Number(p.price) || 1000,
        capacity: Number(p.capacity) || 200,
      }));
      setGeneralTiers(parsedTiers);
    }
  }, [formData.showId]);

  // Image preview sync
  useEffect(() => {
    if (formData.image) {
      setImagePreview(getCdnUrl(formData.image, "shows"));
    } else {
      setImagePreview(null);
    }
  }, [formData.image]);

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await getCity();
        setCities(response || []);
      } catch (error) {
        console.error("Error loading cities:", error);
        setErrors((prev) => ({ ...prev, cities: "Failed to load cities" }));
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  // Load dramas
  useEffect(() => {
    const loadDramas = async () => {
      setIsLoadingDramas(true);
      try {
        const response = await getDramas({
          page: 0,
          size: 50,
        });
        setDramas(response.data?.content || []);
      } catch (error) {
        console.error("Error loading Dramas:", error);
        setErrors((prev) => ({ ...prev, dramas: "Failed to load Dramas" }));
      } finally {
        setIsLoadingDramas(false);
      }
    };
    loadDramas();
  }, []);

  // Load theatres
  useEffect(() => {
    const loadTheatres = async () => {
      setIsLoadingTheatres(true);
      try {
        const response = await getTheatresByUserId(userId);
        const list = response.data || [];
        setTheatres((prev) => {
          if (formData.theatre && formData.theatre.id) {
            const hasCurr = list.some((t) => Number(t.id) === Number(formData.theatre.id));
            return hasCurr ? list : [formData.theatre, ...list];
          }
          return list;
        });
      } catch (error) {
        console.error("Error loading theatres:", error);
        setErrors((prev) => ({ ...prev, theatres: "Failed to load theatres" }));
      } finally {
        setIsLoadingTheatres(false);
      }
    };
    if (userId) {
      loadTheatres();
    }
  }, [userId, formData.theatre]);

  // Load seat types when theater is selected in reserved mode
  useEffect(() => {
    const loadSeatTypes = async () => {
      if (seatingMode !== "reserved" || !formData.theaterId) {
        setSeatTypes([]);
        return;
      }

      setIsLoadingSeatTypes(true);
      try {
        const response = await getSeatTypesByTheatreId(formData.theaterId);
        const seatTypesData = response.data || [];
        setSeatTypes(seatTypesData);

        // Preserve existing pricing or initialize
        setFormData((prev) => {
          const currentPricing = prev.pricing || [];
          const updatedPricing = seatTypesData.map((type) => {
            const existing = currentPricing.find((p) => Number(p.seatTypeId) === Number(type.id));
            return existing || { seatTypeId: type.id, price: 0 };
          });
          return { ...prev, pricing: updatedPricing };
        });
      } catch (error) {
        console.error("Error loading seat types:", error);
        setErrors((prev) => ({
          ...prev,
          seatTypes: "Failed to load seat types for selected theatre",
        }));
      } finally {
        setIsLoadingSeatTypes(false);
      }
    };

    loadSeatTypes();
  }, [formData.theaterId, seatingMode, setFormData]);

  // Format 24h to 12h display
  const formatTimeSlot = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Add a showtime slot
  const handleAddTimeSlot = (timeToAdd) => {
    const slot = (timeToAdd || newTimeInput).trim();
    if (!slot) return;
    if (timeSlots.includes(slot)) {
      setNewTimeInput("");
      return;
    }
    const updated = [...timeSlots, slot].sort();
    setTimeSlots(updated);
    setNewTimeInput("");

    // Sync with formData
    setFormData((prev) => ({
      ...prev,
      showTime: updated[0] || "",
      showTimes: updated.join(", "),
    }));

    if (errors.showTime) {
      setErrors((prev) => ({ ...prev, showTime: undefined }));
    }
  };

  const handleRemoveTimeSlot = (slotToRemove) => {
    const updated = timeSlots.filter((s) => s !== slotToRemove);
    setTimeSlots(updated);
    setFormData((prev) => ({
      ...prev,
      showTime: updated[0] || "",
      showTimes: updated.join(", "),
    }));
  };

  // Switch Seating Mode
  const handleSwitchSeatingMode = (mode) => {
    setSeatingMode(mode);
    if (mode === "general") {
      setFormData((prev) => ({
        ...prev,
        theaterId: null,
        theatre: null,
        pricing: generalTiers.map((t) => ({
          seatTypeId: null,
          tierName: t.tierName,
          price: t.price,
        })),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        theaterId: theatres[0]?.id || null,
        theatre: theatres[0] || null,
      }));
    }
  };

  // General Admission Tiers Management
  const handleAddGeneralTier = () => {
    const newTier = {
      tierName: `Tier ${generalTiers.length + 1}`,
      price: 1000,
      capacity: 100,
    };
    const updated = [...generalTiers, newTier];
    setGeneralTiers(updated);
    setFormData((prev) => ({
      ...prev,
      pricing: updated.map((t) => ({
        seatTypeId: null,
        tierName: t.tierName,
        price: t.price,
      })),
    }));
  };

  const handleRemoveGeneralTier = (index) => {
    if (generalTiers.length <= 1) return;
    const updated = generalTiers.filter((_, i) => i !== index);
    setGeneralTiers(updated);
    setFormData((prev) => ({
      ...prev,
      pricing: updated.map((t) => ({
        seatTypeId: null,
        tierName: t.tierName,
        price: t.price,
      })),
    }));
  };

  const handleGeneralTierChange = (index, field, value) => {
    const updated = [...generalTiers];
    updated[index] = {
      ...updated[index],
      [field]: field === "price" || field === "capacity" ? Number(value) || 0 : value,
    };
    setGeneralTiers(updated);
    setFormData((prev) => ({
      ...prev,
      pricing: updated.map((t) => ({
        seatTypeId: null,
        tierName: t.tierName,
        price: t.price,
      })),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Show title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Show synopsis and details are required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Venue location name is required";
    }

    if (!formData.showDate) {
      newErrors.showDate = "Show date is required";
    }

    if (timeSlots.length === 0 && !formData.showTime) {
      newErrors.showTime = "At least one showtime slot is required";
    }

    if (!formData.cityId) {
      newErrors.cityId = "City selection is required";
    }

    if (!formData.dramaId) {
      newErrors.dramaId = "Associated drama selection is required";
    }

    // Seating-specific validation
    if (seatingMode === "reserved") {
      if (!formData.theaterId) {
        newErrors.theaterId = "Theatre hall layout selection is required for reserved seating";
      }
      if (formData.pricing && formData.pricing.length > 0) {
        const hasInvalid = formData.pricing.some((p) => !p.price || p.price <= 0);
        if (hasInvalid) {
          newErrors.pricing = "All seat categories must have a valid price greater than 0 LKR";
        }
      } else {
        newErrors.pricing = "Selected theatre hall has no seat categories configured";
      }
    } else {
      // General admission validation & state synchronization
      const hasInvalidTiers = generalTiers.some((t) => !t.price || t.price <= 0 || !t.tierName?.trim());
      if (hasInvalidTiers) {
        newErrors.pricing = "Each ticket tier must have a valid name and price greater than 0 LKR";
      } else {
        setFormData((prev) => ({
          ...prev,
          theaterId: null,
          theatre: null,
          pricing: generalTiers.map((t) => ({
            seatTypeId: null,
            tierName: t.tierName,
            price: Number(t.price) || 0,
          })),
        }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Only image files are allowed (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const category = "shows";
      const title = formData.title || "show";
      const uploadRes = await uploadFile(file, category, title);
      const uploadedFile = uploadRes.filePath || uploadRes.fileName;

      setImagePreview(getCdnUrl(uploadedFile, "shows"));
      setFormData((prev) => ({ ...prev, image: uploadedFile }));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
      notify.success("Show poster uploaded successfully!");
    } catch (err) {
      notify.apiError(err, "Show poster upload failed. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

  const handlePricingChange = (index, value) => {
    const updatedPricing = [...(formData.pricing || [])];
    updatedPricing[index] = {
      ...updatedPricing[index],
      price: parseInt(value, 10) || 0,
    };
    setFormData((prev) => ({ ...prev, pricing: updatedPricing }));
    if (errors.pricing) {
      setErrors((prev) => ({ ...prev, pricing: undefined }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedTheatreObj = theatres.find((t) => Number(t.id) === Number(formData.theaterId)) || formData.theatre;

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto font-sans">
      {/* SECTION 1: Production Details & Poster Studio */}
      <div className="bg-[#161624] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] flex items-center justify-center text-[#FED800] shadow-sm">
              <Theater className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                Production Details & Poster Studio
              </h4>
              <p className="text-xs text-slate-400">
                Define the show identity, associated drama, synopsis, and event banner.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FED800]/15 text-[#FED800] border border-[#FED800]/30 uppercase tracking-wider">
            Step 1
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Title, Drama, Description */}
          <div className="lg:col-span-7 space-y-4">
            {/* Show Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                <FileText className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
                Show Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                className={`w-full bg-[#1e1e2d] border ${
                  errors.title ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all`}
                placeholder="e.g. Suba Saha Yasa - Colombo Grand Gala"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
              {errors.title && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Drama Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                <Theater className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
                Associated Stage Drama <span className="text-rose-400">*</span>
              </label>
              <select
                className={`w-full bg-[#1e1e2d] border ${
                  errors.dramaId ? "border-rose-500" : "border-white/15"
                } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all`}
                value={formData.dramaId || ""}
                onChange={(e) => handleInputChange("dramaId", parseInt(e.target.value, 10))}
                disabled={isLoadingDramas}
              >
                <option value="" className="bg-[#1e1e2d] text-slate-400">
                  {isLoadingDramas ? "Loading dramas from repertory..." : "Select drama production"}
                </option>
                {dramas.map((drama) => (
                  <option key={drama.id} value={drama.id} className="bg-[#1e1e2d] text-white">
                    {drama.title}
                  </option>
                ))}
              </select>
              {errors.dramaId && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.dramaId}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Event Synopsis & Patron Guidance <span className="text-rose-400">*</span>
              </label>
              <textarea
                className={`w-full bg-[#1e1e2d] border ${
                  errors.description ? "border-rose-500" : "border-white/15"
                } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all resize-none`}
                placeholder="Highlight starring cast, intermission schedule, age restrictions, and special guidelines for attendees..."
                rows={4}
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Poster Image Upload */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <ImageIcon className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
              Event Poster / Banner Image
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 group aspect-[16/10] bg-black/60 flex items-center justify-center shadow-lg">
                <img
                  src={imagePreview}
                  alt="Show Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="cursor-pointer bg-[#FED800] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#ffe033] transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-xs font-bold transition-all"
                    title="Remove banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 font-semibold flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>CDN Ready</span>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block flex-1">
                <div className="border-2 border-dashed border-white/15 hover:border-[#FED800]/50 rounded-2xl p-6 text-center transition-all bg-[#1e1e2d]/60 hover:bg-[#1e1e2d] flex flex-col items-center justify-center gap-3 min-h-[220px]">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FED800] shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Upload High-Res Poster</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Recommended 16:9 or 3:4 ratio (PNG, JPG, WEBP up to 5MB)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-[#FED800] mt-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading asset to Sri Lanka CDN edge...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Dates & Multi-Showtime Slots Scheduling */}
      <div className="bg-[#161624] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] flex items-center justify-center text-[#FED800] shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                Show Date & Multiple Showtimes Scheduling
              </h4>
              <p className="text-xs text-slate-400">
                Configure calendar dates and multi-slot performances (e.g. Matinee 3:30 PM &amp; Evening 6:30 PM).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FED800]/15 text-[#FED800] border border-[#FED800]/30 uppercase tracking-wider">
            Step 2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Show Date */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Calendar className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
              Performance Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              style={{ colorScheme: "dark" }}
              className={`w-full bg-[#1e1e2d] border ${
                errors.showDate ? "border-rose-500" : "border-white/15"
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all`}
              value={formData.showDate || ""}
              onChange={(e) => handleInputChange("showDate", e.target.value)}
            />
            {errors.showDate && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.showDate}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Select the primary curtain-raise calendar date for this production.
            </p>
          </div>

          {/* Multiple Showtimes Manager */}
          <div className="md:col-span-7 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Clock className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
              Showtime Performance Slots <span className="text-rose-400">*</span>
            </label>

            {/* Time input & Add button */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                style={{ colorScheme: "dark" }}
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="bg-[#1e1e2d] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FED800] flex-1"
              />
              <button
                type="button"
                onClick={() => handleAddTimeSlot()}
                className="px-4 py-2 rounded-xl bg-[#661F19] hover:bg-[#7e251e] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slot</span>
              </button>
            </div>

            {/* Quick Common Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Quick add:</span>
              <button
                type="button"
                onClick={() => handleAddTimeSlot("15:30")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                + 3:30 PM (Matinee)
              </button>
              <button
                type="button"
                onClick={() => handleAddTimeSlot("18:30")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                + 6:30 PM (Evening)
              </button>
              <button
                type="button"
                onClick={() => handleAddTimeSlot("19:00")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                + 7:00 PM (Night)
              </button>
            </div>

            {/* Active Time Slots Chips */}
            <div className="pt-2">
              {timeSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {slot} ({formatTimeSlot(slot)})
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(slot)}
                        className="text-amber-400/70 hover:text-rose-400 transition-colors p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please add at least one showtime performance slot.
                </p>
              )}
            </div>

            {errors.showTime && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.showTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Venue, Door Guidance & Seating Architecture Selector */}
      <div className="bg-[#161624] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] flex items-center justify-center text-[#FED800] shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                Venue Location & Seating Architecture
              </h4>
              <p className="text-xs text-slate-400">
                Choose between interactive reserved auditorium seating or general admission / open grounds.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FED800]/15 text-[#FED800] border border-[#FED800]/30 uppercase tracking-wider">
            Step 3
          </span>
        </div>

        {/* City & Venue Name */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <MapPin className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
              City <span className="text-rose-400">*</span>
            </label>
            <select
              className={`w-full bg-[#1e1e2d] border ${
                errors.cityId ? "border-rose-500" : "border-white/15"
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all`}
              value={formData.cityId || ""}
              onChange={(e) => handleInputChange("cityId", parseInt(e.target.value, 10))}
              disabled={isLoadingCities}
            >
              <option value="" className="bg-[#1e1e2d] text-slate-400">
                {isLoadingCities ? "Loading cities..." : "Select city"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id} className="bg-[#1e1e2d] text-white">
                  {city.cityName}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.cityId}
              </p>
            )}
          </div>

          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              <MapPin className="inline w-3.5 h-3.5 text-[#FED800] mr-1.5" />
              Venue & Specific Hall Location <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-[#1e1e2d] border ${
                errors.location ? "border-rose-500" : "border-white/15"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] focus:ring-1 focus:ring-[#FED800] transition-all`}
              placeholder="e.g. Lionel Wendt Art Centre, Main Auditorium"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
            {errors.location && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location}
              </p>
            )}
          </div>
        </div>

        {/* Seating Mode Switcher: Cards */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Seating & Ticketing Architecture <span className="text-rose-400">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Reserved Seating */}
            <div
              onClick={() => handleSwitchSeatingMode("reserved")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                seatingMode === "reserved"
                  ? "bg-[#661F19]/20 border-[#FED800] shadow-lg shadow-[#661F19]/20"
                  : "bg-[#1e1e2d]/60 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      seatingMode === "reserved"
                        ? "bg-[#FED800] text-black"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Reserved Seating (Hall Map)</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Patrons pick numbered seats on an interactive 2D/3D auditorium map.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    seatingMode === "reserved"
                      ? "border-[#FED800] bg-[#FED800]"
                      : "border-slate-500"
                  }`}
                >
                  {seatingMode === "reserved" && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </div>
              </div>

              {seatingMode === "reserved" && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Registered Theatre Hall <span className="text-rose-400">*</span>
                  </label>
                  <select
                    className={`w-full bg-[#14141e] border ${
                      errors.theaterId ? "border-rose-500" : "border-white/15"
                    } rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FED800]`}
                    value={formData.theaterId || ""}
                    onChange={(e) => handleInputChange("theaterId", parseInt(e.target.value, 10))}
                    disabled={isLoadingTheatres}
                  >
                    <option value="" className="bg-[#14141e] text-slate-400">
                      {isLoadingTheatres ? "Loading theatres..." : "Select registered theatre hall layout"}
                    </option>
                    {theatres.map((theatre) => (
                      <option key={theatre.id} value={theatre.id} className="bg-[#14141e] text-white">
                        {theatre.name} ({theatre.city?.cityName || "Hall"})
                      </option>
                    ))}
                  </select>
                  {errors.theaterId && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.theaterId}
                    </p>
                  )}

                  {/* Show Selected Theatre Door & Facilities Summary */}
                  {selectedTheatreObj && (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <DoorOpen className="w-3.5 h-3.5" />
                        <span>Theatre Entrance & Facilities</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Entrance Gate: <strong className="text-slate-200">{selectedTheatreObj.entranceGate || "Main Gate"}</strong>
                        {selectedTheatreObj.doorDetails && (
                          <> • Doors: <strong className="text-slate-200">{selectedTheatreObj.doorDetails}</strong></>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedTheatreObj.hasAirConditioning && (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-semibold border border-sky-500/20">
                            ❄️ Air Conditioned
                          </span>
                        )}
                        {selectedTheatreObj.hasWheelchairAccess && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                            ♿ Wheelchair Access
                          </span>
                        )}
                        {selectedTheatreObj.parkingCapacity > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold border border-amber-500/20">
                            🚗 Parking ({selectedTheatreObj.parkingCapacity} vehicles)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mode 2: General Admission */}
            <div
              onClick={() => handleSwitchSeatingMode("general")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                seatingMode === "general"
                  ? "bg-[#661F19]/20 border-[#FED800] shadow-lg shadow-[#661F19]/20"
                  : "bg-[#1e1e2d]/60 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      seatingMode === "general"
                        ? "bg-[#FED800] text-black"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">General Admission / Open Venue</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      For open grounds, amphitheaters, or standing tickets without seat numbering.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    seatingMode === "general"
                      ? "border-[#FED800] bg-[#FED800]"
                      : "border-slate-500"
                  }`}
                >
                  {seatingMode === "general" && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </div>
              </div>

              {seatingMode === "general" && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No Theatre Hall Layout Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ticket buyers select their desired ticket category and quantity (e.g. 2 x Standard, 1 x VIP) directly without picking seats on a map.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Ticket Pricing Matrix */}
      <div className="bg-[#161624] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] flex items-center justify-center text-[#FED800] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                Ticket Pricing & Tier Matrix
              </h4>
              <p className="text-xs text-slate-400">
                {seatingMode === "reserved"
                  ? "Set ticket pricing for each seat type in the chosen theatre layout."
                  : "Create custom ticket tiers, price points, and capacities for open admission."}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FED800]/15 text-[#FED800] border border-[#FED800]/30 uppercase tracking-wider">
            Step 4
          </span>
        </div>

        {/* Reserved Seating Pricing Matrix */}
        {seatingMode === "reserved" ? (
          formData.theaterId ? (
            isLoadingSeatTypes ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FED800]" />
                Loading seat categories for selected theatre...
              </div>
            ) : seatTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seatTypes.map((seatType, index) => (
                  <div
                    key={seatType.id}
                    className="bg-[#1e1e2d] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-white/20 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {seatType.typeName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/30">
                          Tier {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Armchair className="w-3.5 h-3.5" />
                        <span>
                          Hall Capacity:{" "}
                          <strong className="text-slate-200">{seatType.totalSeats} seats</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          LKR
                        </span>
                        <input
                          required
                          type="number"
                          min="0"
                          step="50"
                          className="w-32 bg-[#12121a] border border-white/15 rounded-xl pl-12 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-[#FED800] transition-colors"
                          placeholder="0"
                          value={formData.pricing?.[index]?.price || ""}
                          onChange={(e) => handlePricingChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No seat categories found for this theatre hall. Please configure seat categories in Theatre Builder first.
              </p>
            )
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-white/5 rounded-xl border border-white/10">
              Please select a registered theatre hall in Step 3 above to load its seat tier matrix.
            </div>
          )
        ) : (
          /* General Admission Dynamic Tiers */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">
                General Admission Ticket Tiers ({generalTiers.length})
              </span>
              <button
                type="button"
                onClick={handleAddGeneralTier}
                className="px-3 py-1.5 rounded-xl bg-[#661F19] hover:bg-[#7e251e] text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-3">
              {generalTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="bg-[#1e1e2d] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Tier Name
                    </label>
                    <input
                      type="text"
                      value={tier.tierName}
                      onChange={(e) => handleGeneralTierChange(idx, "tierName", e.target.value)}
                      placeholder="e.g. Standard Entry / Early Bird"
                      className="w-full bg-[#12121a] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED800]"
                    />
                  </div>

                  <div className="w-full sm:w-1/4">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Ticket Price (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={tier.price}
                        onChange={(e) => handleGeneralTierChange(idx, "price", e.target.value)}
                        placeholder="1000"
                        className="w-full bg-[#12121a] border border-white/15 rounded-xl pl-11 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#FED800]"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/4">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Allocation Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tier.capacity}
                      onChange={(e) => handleGeneralTierChange(idx, "capacity", e.target.value)}
                      placeholder="200"
                      className="w-full bg-[#12121a] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED800]"
                    />
                  </div>

                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveGeneralTier(idx)}
                      disabled={generalTiers.length <= 1}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 disabled:opacity-30 transition-colors"
                      title="Delete tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.pricing && (
          <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.pricing}
          </p>
        )}
      </div>
    </div>
  );
});

ShowForm.displayName = "ShowForm";

export default ShowForm;
