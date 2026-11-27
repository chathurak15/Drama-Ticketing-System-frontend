"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Theater, Clock, Upload, Film, AlertCircle, Loader2, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { getActors } from "../../../services/ActorService";
import { uploadFile } from "../../../services/FileService";
import { getCdnUrl } from "../../../utils/cdn";
import notify from "../../../utils/notify";

const DramaForm = forwardRef(({ formData, setFormData }, ref) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [availableActors, setAvailableActors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errors, setErrors] = useState({});
  const pageSize = 15;

  useEffect(() => {
    loadActors(0, true);
  }, []);

  // Merge cast actors from current drama so they always appear in the list and can be toggled
  useEffect(() => {
    if (Array.isArray(formData.actors) && formData.actors.length > 0) {
      setAvailableActors((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const missing = formData.actors.filter((a) => a && a.id && !existingIds.has(a.id));
        if (missing.length > 0) {
          return [...missing, ...prev];
        }
        return prev;
      });
    }
  }, [formData.actors]);

  useEffect(() => {
    if (formData.image) {
      setImagePreview(getCdnUrl(formData.image, "dramas"));
    } else {
      setImagePreview(null);
    }
  }, [formData.image]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim() === "")
      newErrors.title = "Title is required";

    if (!formData.description || formData.description.trim() === "")
      newErrors.description = "Description is required";
    else if (formData.description.length > 5000)
      newErrors.description = "Description too long";

    if (formData.duration !== undefined && formData.duration !== null && formData.duration !== "") {
      const dur = Number(formData.duration);
      if (isNaN(dur) || dur <= 0) {
        newErrors.duration = "Duration must be greater than 0 minutes";
      }
    }

    if (!formData.image || formData.image.trim() === "")
      newErrors.image = "Poster image is required";

    if (!formData.actorIds || formData.actorIds.length === 0)
      newErrors.actorIds = "At least one actor must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

  const loadActors = async (page = 0, replace = false) => {
    try {
      const response = await getActors({
        page,
        size: pageSize,
        name: searchTerm,
      });
      const newActors = response.data.content || [];
      setAvailableActors((prev) =>
        replace ? newActors : [...prev, ...newActors]
      );
      setCurrentPage(page);
      setHasMore(page + 1 < (response.data.totalPages || 1));
    } catch (err) {
      console.error("Error fetching actors:", err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    loadActors(0, true);
  };

  const handleLoadMore = () => {
    loadActors(currentPage + 1);
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
      const category = "dramas";
      const title = formData.title || "drama";

      const uploadRes = await uploadFile(file, category, title);
      const uploadedFile = uploadRes.filePath || uploadRes.fileName;

      setImagePreview(getCdnUrl(uploadedFile, "dramas"));
      setFormData((prev) => ({ ...prev, image: uploadedFile }));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
      notify.success("Drama poster uploaded successfully!");
    } catch (err) {
      notify.apiError(err, "Drama poster upload failed. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleActorSelect = (actorId) => {
    setFormData((prev) => {
      const currentIds = prev.actorIds || [];
      const newIds = currentIds.includes(actorId)
        ? currentIds.filter((id) => id !== actorId)
        : [...currentIds, actorId];
      return { ...prev, actorIds: newIds };
    });
    if (errors.actorIds) {
      setErrors((prev) => ({ ...prev, actorIds: undefined }));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Theater className="w-5 h-5 text-[#FED800]" />
        <h4 className="text-base font-bold text-white tracking-wide">
          Drama Master Record Details
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Drama Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-[#1b1b28] border ${
                errors.title ? "border-rose-500" : "border-white/10"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors`}
              placeholder="e.g. Suba Saha Yasa"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="4"
              className={`w-full bg-[#1b1b28] border ${
                errors.description ? "border-rose-500" : "border-white/10"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors resize-none`}
              placeholder="Provide a synopsis of the drama storyline, themes, background..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Duration (Minutes) <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-[#FED800] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                placeholder="e.g. 135 (runtime in minutes)"
                className={`w-full bg-[#1b1b28] border ${
                  errors.duration ? "border-rose-500" : "border-white/10"
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors`}
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: e.target.value === "" ? "" : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            {errors.duration && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.duration}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Trailer / Video URL
            </label>
            <input
              type="url"
              className="w-full bg-[#1b1b28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.videoUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Drama Poster Image <span className="text-rose-400">*</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 group aspect-[16/9] bg-black/40 flex items-center justify-center shadow-lg">
                <img
                  src={imagePreview}
                  alt="Drama Poster Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="cursor-pointer bg-[#FED800] text-black px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#ffe033] transition-all flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-white/15 hover:border-[#FED800]/50 rounded-2xl p-6 text-center transition-all bg-[#1b1b28]/50 hover:bg-[#1b1b28] flex flex-col items-center justify-center gap-2 aspect-[16/9]">
                  <Upload className="w-8 h-8 text-[#FED800]" />
                  <p className="text-xs font-bold text-white">Click to upload drama poster</p>
                  <p className="text-[10px] text-slate-500">Max size: 5MB</p>
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

            <p className="text-[11px] text-amber-300/90 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Please upload clean, official, non-watermarked theatrical posters (recommended 3:4 portrait or high-res 16:9 format).</span>
            </p>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-[#FED800] mt-1 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading poster...</span>
              </div>
            )}
            {errors.image && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.image}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cast & Actors <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-[#FED800] font-bold">
                {formData.actorIds?.length || 0} selected
              </span>
            </div>

            <input
              type="text"
              className="w-full bg-[#1b1b28] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 mb-2 focus:outline-none focus:border-[#FED800]"
              placeholder="Filter actors by name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />

            <div className="max-h-36 overflow-y-auto border border-white/10 bg-[#14141e] rounded-xl p-2 space-y-1">
              {availableActors.map((actor) => (
                <label
                  key={actor.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-slate-200"
                >
                  <input
                    type="checkbox"
                    className="rounded accent-[#FED800]"
                    checked={formData.actorIds?.includes(actor.id) || false}
                    onChange={() => handleActorSelect(actor.id)}
                  />
                  <span>{actor.name}</span>
                </label>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="text-xs mt-2 px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-colors"
              >
                Load More Actors
              </button>
            )}
            {errors.actorIds && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.actorIds}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DramaForm.displayName = "DramaForm";

export default DramaForm;
