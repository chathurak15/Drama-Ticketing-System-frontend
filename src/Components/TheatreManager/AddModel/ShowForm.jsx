import React, {useState, useEffect,forwardRef, useImperativeHandle,} from "react";
import { Calendar,Clock,MapPin,Theater,Upload,FileText, Armchair,Image} from "lucide-react";
import { getCity } from "../../../services/ShowService";
import { getTheatresByUserId, getSeatTypesByTheatreId,} from "../../../services/TheatreService";
import { getDramas } from "../../../services/dramaService";
import { useAuth } from "../../../utils/AuthContext";
import { uploadFile } from "../../../services/FileService.Js";

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
  const userId = useAuth().user?.id;

  // Initialize form data with default values
  useEffect(() => {
    if (!formData.temporaryTheatre) {
      setFormData((prev) => ({
        ...prev, 
        temporaryTheatre: null,
        userId: userId,
        pricing: [],
      }));
    }
  }, [formData.temporaryTheatre, setFormData]);

  useEffect(() => {
  if (formData.image) {
    setImagePreview(`https://d3ay14vkclriu.cloudfront.net/uploads/shows/${formData.image}`);
  } else {
    setImagePreview(null);
  }
}, [formData.image]);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await getCity();
        setCities(response);
      } catch (error) {
        console.error("Error loading cities:", error);
        setErrors((prev) => ({ ...prev, cities: "Failed to load cities" }));
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    const loadDramas = async () => {
      setIsLoadingDramas(true);
      try {
        const response = await getDramas({
          page:0,
          size:45,
      });
        setDramas(response.data.content);
      } catch (error) {
        console.error("Error loading Dramas:", error);
        setErrors((prev) => ({ ...prev, cities: "Failed to load Dramas" }));
      } finally {
        setIsLoadingDramas(false);
      }
    };

    loadDramas();
  }, []);

  // Load theatres when component mounts
  useEffect(() => {
    const loadTheatres = async () => {
      setIsLoadingTheatres(true);
      try {
        const response = await getTheatresByUserId(userId);
        setTheatres(response.data || []);
      } catch (error) {
        console.error("Error loading theatres:", error);
        setErrors((prev) => ({ ...prev, theatres: "Failed to load theatres" }));
      } finally {
        setIsLoadingTheatres(false);
      }
    };

    loadTheatres();
  }, []);

  // Load seat types when theater is selected
  useEffect(() => {
    const loadSeatTypes = async () => {
      if (!formData.theaterId) {
        setSeatTypes([]);
        setFormData((prev) => ({ ...prev, pricing: [] }));
        return;
      }

      setIsLoadingSeatTypes(true);
      try {
        const response = await getSeatTypesByTheatreId(formData.theaterId);
        const seatTypesData = response.data || [];
        setSeatTypes(seatTypesData);

        // Initialize pricing array for each seat type
        const initialPricing = seatTypesData.map((type) => ({
          seatTypeId: type.id,
          price: 0,
        }));

        setFormData((prev) => ({ ...prev, pricing: initialPricing }));
      } catch (error) {
        console.error("Error loading seat types:", error);
        setErrors((prev) => ({
          ...prev,
          seatTypes: "Failed to load seat types",
        }));
      } finally {
        setIsLoadingSeatTypes(false);
      }
    };

    loadSeatTypes();
  }, [formData.theaterId, setFormData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.showDate) {
      newErrors.showDate = "Show date is required";
    }

    if (!formData.showTime) {
      newErrors.showTime = "Show time is required";
    }

    if (!formData.cityId) {
      newErrors.cityId = "City is required";
    }

    if (!formData.dramaId) {
      newErrors.dramaId = "Drama is required";
    }

    if (!formData.theaterId) {
      newErrors.theaterId = "Theatre is required";
    }

    // Validate pricing
    if (formData.pricing && formData.pricing.length > 0) {
      const hasInvalidPricing = formData.pricing.some(
        (p) => !p.price || p.price <= 0
      );
      if (hasInvalidPricing) {
        newErrors.pricing =
          "All seat types must have a valid price greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    const category = "shows";
    const title = formData.title || "show";

    const uploadRes = await uploadFile(file, category, title);
    const uploadedFileName = uploadRes.fileName;

    const imageUrl = `https://d3ay14vkclriu.cloudfront.net/uploads/shows/${uploadedFileName}`;
    setImagePreview(imageUrl);
    setFormData((prev) => ({ ...prev, image: uploadedFileName }));
  } catch (err) {
    alert("Image upload failed");
    console.error("Image upload error:", err);
  } finally {
    setIsUploading(false);
  }
};

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

  const handlePricingChange = (index, value) => {
    const updatedPricing = [...(formData.pricing || [])];
    updatedPricing[index] = {
      ...updatedPricing[index],
      price: parseInt(value) || 0,
    };
    setFormData((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <Theater className="w-6 h-6 text-[#661F19]" />
        <h4 className="text-lg font-semibold">Show Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline w-4 h-4 mr-1" />
              Show Title*
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter show title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter show description"
              rows={4}
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Image className="inline w-4 h-4 mr-1" />
              Banner Image*
            </label>
            <label className="cursor-pointer">
              <div className="flex justify-center items-center border-2 border-dashed rounded-lg h-48">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Upload className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            {isUploading && (
              <p className="text-sm text-blue-500 mt-1">Uploading...</p>
            )}
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Show Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Show Date*
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.showDate || ""}
              onChange={(e) => handleInputChange("showDate", e.target.value)}
            />
            {errors.showDate && (
              <p className="text-sm text-red-500">{errors.showDate}</p>
            )}
          </div>

          {/* Show Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              Show Time*
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.showTime || ""}
              onChange={(e) => handleInputChange("showTime", e.target.value)}
            />
            {errors.showTime && (
              <p className="text-sm text-red-500">{errors.showTime}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.cityId || ""}
              onChange={(e) =>
                handleInputChange("cityId", parseInt(e.target.value))
              }
              disabled={isLoadingCities}
            >
              <option value="">
                {isLoadingCities ? "Loading cities..." : "Select city"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.cityName}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-sm text-red-500">{errors.cityId}</p>
            )}
            {errors.cities && (
              <p className="text-sm text-red-500">{errors.cities}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              Venue*
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter venue location"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drama*
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.dramaId || ""}
              onChange={(e) =>
                handleInputChange("dramaId", parseInt(e.target.value))
              }
              disabled={isLoadingDramas}
            >
              <option value="">
                {isLoadingDramas ? "Loading Drama..." : "Select Drama"}
              </option>
              {dramas.map((drama) => (
                <option key={drama.id} value={drama.id}>
                  {drama.title}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-sm text-red-500">{errors.dramaId}</p>
            )}
            {errors.drams && (
              <p className="text-sm text-red-500">{errors.dramas}</p>
            )}
          </div>

          {/* Theatre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Theater className="inline w-4 h-4 mr-1" />
              Theatre*
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              value={formData.theaterId || ""}
              onChange={(e) =>
                handleInputChange("theaterId", parseInt(e.target.value))
              }
              disabled={isLoadingTheatres}
            >
              <option value="">
                {isLoadingTheatres ? "Loading theatres..." : "Select theatre"}
              </option>
              {theatres.map((theatre) => (
                <option key={theatre.id} value={theatre.id}>
                  {theatre.name}
                </option>
              ))}
            </select>
            {errors.theaterId && (
              <p className="text-sm text-red-500">{errors.theaterId}</p>
            )}
            {errors.theatres && (
              <p className="text-sm text-red-500">{errors.theatres}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      {formData.theaterId && (
        <div className="border-t pt-6">
          <h5 className="text-lg font-semibold mb-4">Seat Pricing</h5>
          {isLoadingSeatTypes ? (
            <p className="text-gray-500">Loading seat types...</p>
          ) : seatTypes.length > 0 ? (
            <div className="space-y-3">
              {seatTypes.map((seatType, index) => (
                <div
                  key={seatType.id}
                  className="flex items-center justify-between px-6 p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-sm flex items-center gap-2">
                      Seat Type: {seatType.typeName}
                      <Armchair className="w-5 h-5 text-gray-900" />
                      Total Seat Count: {seatType.totalSeats}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ps-5">
                    <input
                      required
                      type="number"
                      min="0"
                      step="50"
                      className="w-50 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                      placeholder="0"
                      value={formData.pricing?.[index]?.price || ""}
                      onChange={(e) =>
                        handlePricingChange(index, e.target.value)
                      }
                    />
                    <span className="text-medium text-gray-900">LKR</span>
                  </div>
                </div>
              ))}
              {errors.pricing && (
                <p className="text-sm text-red-500">{errors.pricing}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              No seat types available for this theatre.
            </p>
          )}
          {errors.seatTypes && (
            <p className="text-sm text-red-500">{errors.seatTypes}</p>
          )}
        </div>
      )}
    </div>
  );
});

export default ShowForm;
