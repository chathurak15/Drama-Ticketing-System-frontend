import React, { useState } from 'react';
import { User, Upload, Calendar, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const ActorForm = ({ formData, setFormData }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      const response = await axios.post('/api/upload/actor', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update form data with image path
      setFormData(prev => ({
        ...prev,
        photo: `/images/upload/actors/${response.data.filename}`
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <UserIcon className="w-6 h-6 text-[#661F19]" />
        <h4 className="text-lg font-semibold">Actor Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              placeholder="Enter actor's full name"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
              required
              value={formData.gender || ''}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday*</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                required
                pattern="\d{4}-\d{2}-\d{2}"
                value={formData.birthday || ''}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer">
                <div className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#661F19] transition-all">
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
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
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
    </form>
  );
};

export default ActorForm;