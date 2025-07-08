import React, { useState, forwardRef, useImperativeHandle } from "react";
import { User, Upload, Calendar, User as UserIcon } from "lucide-react";
import { uploadFile } from "../../../services/FileService.Js";

const ActorForm = forwardRef(({ formData, setFormData }, ref) => {
  const [imagePreview, setImagePreview] = useState(
      formData.image ? `http://localhost:8080/uploads/actors/${formData.image}` : null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === "")
      newErrors.name = "Name is required";

    if (!formData.gender || formData.gender.trim() === "")
      newErrors.gender = "gender is required";

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
        alert("Only image files are allowed.");
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB.");
        return;
      }
  
      setIsUploading(true);
  
      try {
        const category = "actors";
        const title = formData.name || "actors";
  
        const uploadRes = await uploadFile(file, category, title);
        const uploadedFileName = uploadRes.fileName;
  
        setImagePreview(`http://localhost:8080/uploads/actors/${uploadedFileName}`);
        setFormData((prev) => ({ ...prev, photo: uploadedFileName }));
      } catch (err) {
        alert("Image upload failed");
        console.error("Image upload error:", err);
      } finally {
        setIsUploading(false);
      }
    };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <UserIcon className="w-6 h-6 text-[#661F19]" />
        <h4 className="text-lg font-semibold">Actor Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter actor's full name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender*
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.gender || ""}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                pattern="\d{4}-\d{2}-\d{2}"
                value={formData.birthday || ""}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 ms-15">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer">
                <div className="group px-15 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#661F19] transition-all">
                  {imagePreview || formData.photo ? (
                    <img
                      src={imagePreview || formData.photo}
                      alt="Actor preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#661F19]" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="actor-photo-upload"
                  name="actor-photo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <p className="mt-1 text-sm text-gray-500">Uploading photo...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ActorForm;
