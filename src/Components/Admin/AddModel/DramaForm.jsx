import React, { useState, useEffect } from 'react';
import { Theater, Image, Clock, Users, Upload } from 'lucide-react';

const DramaForm = ({ formData, setFormData, allActors }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [availableActors, setAvailableActors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load available actors from props or API
    setAvailableActors(allActors || []);
  }, [allActors]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      
    //   const response = await axios.post('/api/upload/drama', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });

      // Update form data with image path
    //   setFormData(prev => ({
    //     ...prev,
    //     image: `/images/upload/drama/${response.data.filename}`
    //   }));

    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleActorSelect = (actorId) => {
    setFormData(prev => {
      const currentIds = prev.actorIds || [];
      const newIds = currentIds.includes(actorId)
        ? currentIds.filter(id => id !== actorId)
        : [...currentIds, actorId];
      
      return { ...prev, actorIds: newIds };
    });
  };

  return (
    <form className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Theater className="w-6 h-6 text-[#661F19]" />
        <h4 className="text-lg font-semibold">Drama Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter drama title"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter drama description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                placeholder="e.g., 120"
                min="1"
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="https://youtube.com/example"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drama Poster</label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer">
                <div className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#661F19] transition-all">
                  {imagePreview || formData.image ? (
                    <img 
                      src={imagePreview || formData.image} 
                      alt="Drama poster preview" 
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#661F19]" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <p className="mt-1 text-sm text-gray-500">Uploading image...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Actors</label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {availableActors.length > 0 ? (
                availableActors.map(actor => (
                  <div key={actor.id} className="flex items-center">
                    <input
                      id={`actor-${actor.id}`}
                      type="checkbox"
                      className="h-4 w-4 text-[#661F19] focus:ring-[#661F19] border-gray-300 rounded"
                      checked={formData.actorIds?.includes(actor.id) || false}
                      onChange={() => handleActorSelect(actor.id)}
                    />
                    <label htmlFor={`actor-${actor.id}`} className="ml-2 block text-sm text-gray-700">
                      {actor.name} ({actor.specialties?.join(', ') || 'No specialties'})
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No actors available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DramaForm;