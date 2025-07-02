import React, { useState, useRef } from "react";
import { XCircle } from "lucide-react";
import EventForm from "./ShowForm";
import DramaForm from "./DramaForm";
import ActorForm from "../Actors/ActorForm";
import { addDrama } from "../../../services/dramaService";
import { addActor } from "../../../services/ActorService";

const AddModal = ({ show, onClose, type}) => {
  const [formData, setFormData] = useState({});
  const dramaFormRef = useRef();
  const actorFormRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    if (type === "drama") {
      isValid = dramaFormRef.current?.validate();
    } else if (type === "actor") {
      isValid = actorFormRef.current?.validate();
    }

    if (!isValid) return;

    try {
      if (type === "drama") {
        const response = await addDrama(formData);
        alert(response.data);
      } else if (type === "actor") {
        const response = await addActor(formData);
        alert(response.data);
      } else {
        console.log(`${type} submitted:`, formData);
      }

      onClose();
      setFormData({});
    } catch (err) {
      alert("Submission failed. Please try again.");
      console.error(err);
    }
  };

  const renderForm = () => {
    switch (type) {
      case "event":
        return <EventForm formData={formData} setFormData={setFormData} />;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-7xl mx-auto rounded-lg shadow-xl overflow-y-auto p-10 max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#661F19]">
            Add New {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#661F19] text-white rounded-lg hover:bg-[#4e1612]"
            >
              Add {type?.charAt(0).toUpperCase() + type?.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
