"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Theater, Sparkles, Loader2 } from "lucide-react";
import ShowForm from "../../TheatreManager/AddModel/ShowForm";
import DramaForm from "./DramaForm";
import ActorForm from "../Actors/ActorForm";
import { addDrama } from "../../../services/dramaService";
import { addActor } from "../../../services/ActorService";
import { addShow, updateShow } from "../../../services/ShowService";
import { updateDrama } from "../../../services/dramaService";
import { pingSeoIndex } from "../../../services/seoService";
import { toast } from "react-toastify";

const AddModal = ({ show, onClose, type, editData }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dramaFormRef = useRef();
  const actorFormRef = useRef();
  const showFormRef = useRef();

  // Strip nested objects and initialize clean formData with current data
  useEffect(() => {
    if (!show) {
      setFormData({});
      return;
    }

    if (editData && type === "show") {
      const { city, drama, user, theatre, ...rest } = editData;
      let formattedDate = "";
      if (editData.showDate) {
        if (typeof editData.showDate === "string") {
          formattedDate = editData.showDate.split("T")[0];
        } else {
          try {
            formattedDate = new Date(editData.showDate).toISOString().split("T")[0];
          } catch (e) {
            formattedDate = "";
          }
        }
      }

      setFormData({
        ...rest,
        showId: editData.showId || editData.id,
        title: editData.title || rest.title || "",
        description: editData.description || rest.description || "",
        location: editData.location || rest.location || "",
        cityId: city?.id || rest.cityId || "",
        dramaId: drama?.id || rest.dramaId || "",
        userId: user?.id || rest.userId || "",
        theaterId: theatre?.id ? Number(theatre.id) : (rest.theaterId ? Number(rest.theaterId) : null),
        theatre: theatre || rest.theatre || null,
        showDate: formattedDate,
        showTime: editData.showTime || rest.showTime || "",
        showTimes: editData.showTimes || rest.showTimes || (editData.showTime || ""),
        image: editData.image || rest.image || "",
        pricing: editData.pricing || editData.showPricings || rest.pricing || [],
      });
    } else if (editData && type === "drama") {
      // Map actors or Actors array from backend to actorIds
      const extractedActorIds = Array.isArray(editData.actorIds) && editData.actorIds.length > 0
        ? editData.actorIds
        : (editData.Actors || editData.actors || []).map((a) => a.id || a.actorId).filter(Boolean);

      setFormData({
        id: editData.id,
        title: editData.title || "",
        description: editData.description || "",
        duration: editData.duration || "",
        videoUrl: editData.videoUrl || "",
        image: editData.image || "",
        actorIds: extractedActorIds,
        actors: editData.Actors || editData.actors || [],
      });
    } else if (editData && type === "actor") {
      let formattedBirthday = "";
      if (editData.birthday) {
        formattedBirthday = typeof editData.birthday === "string" 
          ? editData.birthday.split("T")[0] 
          : new Date(editData.birthday).toISOString().split("T")[0];
      }
      setFormData({
        id: editData.id,
        name: editData.name || "",
        gender: editData.gender || "",
        birthday: formattedBirthday,
        photo: editData.photo || "",
      });
    } else {
      setFormData({});
    }
  }, [editData, type, show]);

  const handleClose = () => {
    setFormData({});
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    if (type === "drama") {
      isValid = dramaFormRef.current?.validate();
    } else if (type === "actor") {
      isValid = actorFormRef.current?.validate();
    } else if (type === "show") {
      isValid = showFormRef.current?.validate();
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (type === "drama") {
        let response;
        if (formData.id) {
          response = await updateDrama(formData);
        } else {
          response = await addDrama(formData);
        }
        pingSeoIndex({ type: "DRAMA", identifier: formData.title || formData.slug || "new-drama" });
        toast.success(response.data || "Drama saved successfully");
      } else if (type === "actor") {
        const response = await addActor(formData);
        toast.success(response.data || "Actor profile saved successfully");
      } else if (type === "show") {
        const isGeneral = !formData.theaterId;
        const sanitizedData = {
          ...formData,
          city: undefined,
          drama: undefined,
          user: undefined,
          theatre: undefined,
          status: undefined,
          theaterId: isGeneral ? null : Number(formData.theaterId),
          pricing: Array.isArray(formData.pricing)
            ? formData.pricing.map((p) => ({
                seatTypeId: isGeneral ? null : (p.seatTypeId ? Number(p.seatTypeId) : null),
                price: Number(p.price) || 0,
                tierName: p.tierName || undefined,
              }))
            : [],
        };

        let response;
        if (formData.showId) {
          response = await updateShow(sanitizedData);
        } else {
          response = await addShow(sanitizedData);
        }
        pingSeoIndex({ type: "SHOW", identifier: formData.title || formData.slug || "new-show" });
        toast.success(response.data || "Show production saved successfully");
      }

      handleClose();
    } catch (err) {
      toast.error("Submission failed. Please check inputs and try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case "show":
        return (
          <ShowForm
            ref={showFormRef}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case "drama":
        return (
          <DramaForm
            ref={dramaFormRef}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case "actor":
        return (
          <ActorForm
            ref={actorFormRef}
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  if (!show) return null;

  const isEditing = Boolean(formData.showId || formData.id);
  const typeDisplay = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Item";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#13131e] text-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#161624]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#661F19] to-[#8B1E1E] border border-[#FED800]/40 flex items-center justify-center shadow-lg shadow-[#661F19]/30">
              <Theater className="w-5 h-5 text-[#FED800]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FED800]/20 text-[#FED800] border border-[#FED800]/30 uppercase tracking-wider">
                  {isEditing ? "Editor Mode" : "Creation Studio"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {isEditing ? "Edit" : "Add"} {typeDisplay}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 sm:p-8 flex-1">
            {renderForm()}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#0e0e16] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Fields marked with an asterisk (<span className="text-rose-400 font-bold">*</span>) are mandatory.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#661F19] to-[#8B1E1E] hover:from-[#7e251e] hover:to-[#a12323] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#661F19]/40 transition-all flex items-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : `${isEditing ? "Update" : "Add"} ${typeDisplay}`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
