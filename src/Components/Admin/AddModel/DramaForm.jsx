import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Theater, Clock, Upload } from "lucide-react";
import { getActors } from "../../../services/ActorService";

const DramaForm = forwardRef(({ formData, setFormData }, ref) => {
  const [imagePreview, setImagePreview] = useState(formData.image || null);
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim() === "")
      newErrors.title = "Title is required";

    if (!formData.description || formData.description.trim() === "")
      newErrors.description = "Description is required";
    else if (formData.description.length > 5000)
      newErrors.description = "Description too long";

    if (!formData.duration || formData.duration < 1)
      newErrors.duration = "Duration must be at least 1 minute";

    if (!formData.image || formData.image.trim() === "")
      newErrors.image = "Image is required";

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: file.name }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleActorSelect = (actorId) => {
    setFormData((prev) => {
      const currentIds = prev.actorIds || [];
      const newIds = currentIds.includes(actorId)
        ? currentIds.filter((id) => id !== actorId)
        : [...currentIds, actorId];
      return { ...prev, actorIds: newIds };
    });
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <Theater className="w-6 h-6 text-[#661F19]" />
        <h4 className="text-lg font-semibold">Drama Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Drama title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                min="1"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
              />
            </div>
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.videoUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poster Image
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
              />
            </label>
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actors
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border mb-2 rounded-lg"
              placeholder="Search actors"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {availableActors.map((actor) => (
                <div key={actor.id} className="flex items-center">
                  <input
                    id={`actor-${actor.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-[#661F19]"
                    checked={formData.actorIds?.includes(actor.id) || false}
                    onChange={() => handleActorSelect(actor.id)}
                  />
                  <label
                    htmlFor={`actor-${actor.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {actor.name}
                  </label>
                </div>
              ))}
              {errors.actorIds && (
                <p className="text-sm text-red-500 mt-1">{errors.actorIds}</p>
              )}
            </div>
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="text-sm mt-2 px-3 py-1 border rounded-lg"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DramaForm;
