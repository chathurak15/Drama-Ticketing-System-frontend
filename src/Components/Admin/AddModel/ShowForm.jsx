import React, { useImperativeHandle, forwardRef } from 'react';
import { toast } from 'react-toastify';
import { Theater } from 'lucide-react';
import { getCdnUrl } from '../../../utils/cdn';

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || '';

const inputClass =
  'w-full bg-[#1b1b28] border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl placeholder-slate-500 focus:outline-none focus:border-[#FED800] transition-colors';

const labelClass = 'block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5';

const RequiredStar = () => <span className="text-rose-400 ml-0.5">*</span>;

const ShowForm = forwardRef(({ formData, setFormData }, ref) => {
  useImperativeHandle(ref, () => ({
    validate() {
      const required = [
        { key: 'title', label: 'Show Title' },
        { key: 'description', label: 'Description' },
        { key: 'showDate', label: 'Show Date' },
        { key: 'showTime', label: 'Primary Show Time' },
        { key: 'location', label: 'Venue / Location' },
        { key: 'dramaId', label: 'Drama ID' },
      ];

      for (const { key, label } of required) {
        const val = formData[key];
        if (val === undefined || val === null || String(val).trim() === '') {
          toast.error(`${label} is required.`);
          return false;
        }
      }
      return true;
    },
  }));

  const set = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const isEditing = Boolean(formData.showId);

  const statusColors = {
    approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    rejected: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  };
  const statusLabel =
    formData.status
      ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1)
      : 'Pending';
  const statusColor = statusColors[formData.status] || statusColors.pending;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
        <Theater className="w-4 h-4 text-[#FED800]" />
        <span className="text-sm font-bold text-white">Show Information</span>
      </div>

      {/* Row 1 - Show Title (full width) */}
      <div>
        <label className={labelClass}>
          Show Title <RequiredStar />
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Enter show title"
          value={formData.title || ''}
          onChange={set('title')}
        />
      </div>

      {/* Row 2 - Description (full width) */}
      <div>
        <label className={labelClass}>
          Description <RequiredStar />
        </label>
        <textarea
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Enter a brief description of the show"
          value={formData.description || ''}
          onChange={set('description')}
        />
      </div>

      {/* Row 3 - Show Date | Primary Show Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Show Date <RequiredStar />
          </label>
          <input
            type="date"
            className={inputClass + ' [color-scheme:dark]'}
            value={formData.showDate || ''}
            onChange={set('showDate')}
          />
        </div>
        <div>
          <label className={labelClass}>
            Primary Show Time <RequiredStar />
          </label>
          <input
            type="time"
            className={inputClass + ' [color-scheme:dark]'}
            value={formData.showTime || ''}
            onChange={set('showTime')}
          />
        </div>
      </div>

      {/* Row 4 - Multi-slot Show Times */}
      <div>
        <label className={labelClass}>Additional Show Times</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. 15:30, 18:30, 20:00"
          value={formData.showTimes || ''}
          onChange={set('showTimes')}
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated time slots for multiple screenings on the same date.
        </p>
      </div>

      {/* Row 5 - Venue | City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Venue / Location <RequiredStar />
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Lionel Wendt Theatre"
            value={formData.location || ''}
            onChange={set('location')}
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Colombo"
            value={formData.city || ''}
            onChange={set('city')}
          />
        </div>
      </div>

      {/* Row 6 - Drama ID | Theatre ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Drama ID <RequiredStar />
          </label>
          <input
            type="number"
            min={1}
            className={inputClass}
            placeholder="Drama ID"
            value={formData.dramaId || ''}
            onChange={set('dramaId')}
          />
        </div>
        <div>
          <label className={labelClass}>Theatre ID</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            placeholder="Leave blank for General Admission"
            value={formData.theatreId || ''}
            onChange={set('theatreId')}
          />
          <p className="mt-1 text-xs text-slate-500">
            Leave blank for General Admission seating.
          </p>
        </div>
      </div>

      {/* Row 7 - Base Ticket Price | Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Base Ticket Price (LKR)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            placeholder="e.g. 1500"
            value={formData.price || ''}
            onChange={set('price')}
          />
        </div>
        <div>
          <label className={labelClass}>Show Status</label>
          {isEditing ? (
            <div className="flex items-center h-[42px]">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center h-[42px]">
              <span className="text-xs text-slate-500 italic">
                Status is set by admin after review.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Banner Image Upload */}
      <div>
        <label className={labelClass}>Banner Image</label>

        {/* Existing banner thumbnail (edit mode) */}
        {isEditing && formData.image && (
          <div className="mb-3 flex items-center gap-3">
            <img
              src={getCdnUrl(formData.image, "shows")}
              alt="Current banner"
              className="h-16 w-28 object-cover rounded-lg border border-white/10"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-xs text-slate-400">Current banner image</span>
          </div>
        )}

        {/* File drop zone */}
        <label
          htmlFor="bannerImageInput"
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-[#FED800]/50 transition-colors"
        >
          {formData.bannerImage ? (
            <span className="text-sm text-[#FED800] font-medium">
              {formData.bannerImage.name}
            </span>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-slate-500 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm text-slate-400">
                Click to upload a banner image
              </span>
              <span className="text-xs text-slate-600 mt-1">
                PNG, JPG, WEBP recommended
              </span>
            </>
          )}
        </label>
        <input
          id="bannerImageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            setFormData({ ...formData, bannerImage: e.target.files[0] })
          }
        />
      </div>
    </div>
  );
});

ShowForm.displayName = 'ShowForm';

export default ShowForm;
