import React, { useState, useRef, useEffect } from "react";
import { XCircle } from "lucide-react";
import ShowForm from "../../TheatreManager/AddModel/ShowForm";
import DramaForm from "./DramaForm";
import ActorForm from "../Actors/ActorForm";
import { addDrama } from "../../../services/dramaService";
import { addActor } from "../../../services/ActorService";
import { addShow, updateShow } from "../../../services/ShowService";
import { updateDrama } from "../../../services/dramaService";

const AddModal = ({ show, onClose, type, editData }) => {
  const [formData, setFormData] = useState({});
  const dramaFormRef = useRef();
  const actorFormRef = useRef();
  const showFormRef = useRef();

  // Strip nested objects and initialize clean formData
  useEffect(() => {
    if (editData && type === "show") {
      const { city, drama, user, ...rest } = editData;
      setFormData({
        ...rest,
        cityId: city?.id || rest.cityId,
        dramaId: drama?.id || rest.dramaId,
        userId: user?.id || rest.userId,
      });
    } else {
      setFormData(editData || {});
    }
  }, [editData, type]);

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

    try {
      if (type === "drama") {
        let response;
        if (formData.id) {
          response = await updateDrama(formData);
        } else {
          response = await addDrama(formData);
        }
        alert(response.data || "Drama saved successfully");
      } else if (type === "actor") {
        const response = await addActor(formData);
        alert(response.data);
      } else if (type === "show") {
        const sanitizedData = {
          ...formData,
          city: undefined,
          drama: undefined,
          user: undefined,
          status: undefined,
        };

        let response;
        if (formData.showId) {
          response = await updateShow(sanitizedData);
        } else {
          response = await addShow(sanitizedData);
        }
        alert(response.data || "Show saved successfully");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-7xl mx-auto rounded-lg shadow-xl overflow-y-auto p-10 max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#661F19]">
            {formData.showId ? "Edit" : "Add"}{" "}
            {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
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
              {formData.showId || formData.id ? "Update" : "Add"}{" "}
              {type?.charAt(0).toUpperCase() + type?.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
