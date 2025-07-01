import React from 'react';

const ShowForm = ({ formData, setFormData }) => (
  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
        placeholder="Enter event title"
        required
        value={formData.title || ''}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
    </div>
    {/* Other form fields */}
  </form>
);

export default ShowForm;