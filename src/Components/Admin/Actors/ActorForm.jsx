"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { User, Upload, Calendar, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { uploadFile } from "../../../services/FileService";
import { getCdnUrl } from "../../../utils/cdn";
import notify from "../../../utils/notify";

const ActorForm = forwardRef(({ formData, setFormData }, ref) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.photo) {
      setImagePreview(getCdnUrl(formData.photo, "actors"));
    } else {
      setImagePreview(null);
    }
  }, [formData.photo]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === "")
      newErrors.name = "Full name is required";

    if (!formData.gender || formData.gender.trim() === "")
      newErrors.gender = "Gender selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

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
      const category = "actors";
      const title = formData.name || "actors";

      const uploadRes = await uploadFile(file, category, title);
      const uploadedFile = uploadRes.filePath || uploadRes.fileName;

      setImagePreview(getCdnUrl(uploadedFile, "actors"));
      setFormData((prev) => ({ ...prev, photo: uploadedFile }));
      notify.success("Actor photo uploaded successfully!");
    } catch (err) {
      notify.apiError(err, "Actor photo upload failed. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <User className="w-5 h-5 text-[#FED800]" />
        <h4 className="text-base font-bold text-white tracking-wide">
          Actor Profile Information
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-[#1b1b28] border ${
                errors.name ? "border-rose-500" : "border-white/10"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors`}
              placeholder="e.g. Jackson Anthony"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Gender <span className="text-rose-400">*</span>
            </label>
            <select
              className={`w-full bg-[#1b1b28] border ${
                errors.gender ? "border-rose-500" : "border-white/10"
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED800] transition-colors`}
              value={formData.gender || ""}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="" className="bg-[#1b1b28] text-slate-400">Select gender</option>
              <option value="Male" className="bg-[#1b1b28] text-white">Male</option>
              <option value="Female" className="bg-[#1b1b28] text-white">Female</option>
              <option value="Other" className="bg-[#1b1b28] text-white">Other</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.gender}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Birthday
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#FED800] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                style={{ colorScheme: "dark" }}
                className="w-full bg-[#1b1b28] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED800] transition-colors"
                value={formData.birthday || ""}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Profile Photo
            </label>
            {imagePreview || formData.photo ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 group aspect-square max-h-52 bg-black/40 flex items-center justify-center shadow-lg">
                <img
                  src={imagePreview || formData.photo}
                  alt="Actor preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-[#FED800] text-black px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#ffe033] transition-all flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Change Photo</span>
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
                <div className="border-2 border-dashed border-white/15 hover:border-[#FED800]/50 rounded-2xl p-6 text-center transition-all bg-[#1b1b28]/50 hover:bg-[#1b1b28] flex flex-col items-center justify-center gap-2 aspect-square max-h-52">
                  <Upload className="w-8 h-8 text-[#FED800]" />
                  <p className="text-xs font-bold text-white">Click to upload actor photo</p>
                  <p className="text-[10px] text-slate-500">PNG, JPG up to 5MB</p>
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
              <div className="flex items-center gap-2 text-xs text-[#FED800] mt-1 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading actor photo...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ActorForm.displayName = "ActorForm";

export default ActorForm;
