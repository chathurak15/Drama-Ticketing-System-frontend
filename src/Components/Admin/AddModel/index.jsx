import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import EventForm from './ShowForm';
import DramaForm from './DramaForm';
import ActorForm from './ActorForm';

const AddModal = ({ show, onClose, type }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here - connect to your Spring Boot API
    console.log('Form submitted:', formData);
    onClose();
    setFormData({});
  };

  const renderForm = () => {
    switch(type) {
      case 'event': return <EventForm formData={formData} setFormData={setFormData} />;
      case 'drama': return <DramaForm formData={formData} setFormData={setFormData} />;
      case 'actor': return <ActorForm formData={formData} setFormData={setFormData} />;
      default: return null;
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Add New {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {renderForm()}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#661F19] text-white rounded-lg hover:bg-[#541612]"
          >
            Add {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;