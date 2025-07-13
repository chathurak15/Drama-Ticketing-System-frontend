import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye, MapPin } from "lucide-react";
import { addTheatre,updateTheatre } from "../../services/TheatreService";
import { useAuth } from "../../utils/AuthContext";

const AddTheatre = ({theatreToEdit, onSuccess = () => {}}) => {
  const user = useAuth();
  const [theaterData, setTheaterData] = useState({
    name: "",
    areaType: "THEATRE",
    status: "PERMANENT",
    totalCapacity: 0,
    openAreaPrice: 0,
    seatTypes: [{ typeName: "VIP", totalSeats: 30, seatsPerRow: 15 }],
  });

   useEffect(() => {
    if (theatreToEdit) {
      setTheaterData(theatreToEdit);
    }
  }, [theatreToEdit]);
  
  const [showPreview, setShowPreview] = useState(true);

  const handleInputChange = (field, value) => {
    setTheaterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSeatTypeChange = (index, field, value) => {
    const updatedSeatTypes = [...theaterData.seatTypes];
    updatedSeatTypes[index][field] =
      field === "typeName" ? value : parseInt(value) || 0;
    setTheaterData((prev) => ({
      ...prev,
      seatTypes: updatedSeatTypes,
    }));
  };

  const addSeatType = () => {
    setTheaterData((prev) => ({
      ...prev,
      seatTypes: [
        ...prev.seatTypes,
        { typeName: "", totalSeats: 0, seatsPerRow: 0 },
      ],
    }));
  };

  const removeSeatType = (index) => {
    setTheaterData((prev) => ({
      ...prev,
      seatTypes: prev.seatTypes.filter((_, i) => i !== index),
    }));
  };

 const handleSubmit = async () => {
    try {
      let response;
      if (theatreToEdit) {
        response = await updateTheatre(theaterData);
        if(response.status === 200){
          alert(response.data)
          if (onSuccess) onSuccess();
        }else{
          alert("update Failed! try Again!")
        }
      } else {
        response = await addTheatre(theaterData, user.user?.id);
        if(response.status === 200){
          alert(response.data)
          if (onSuccess) onSuccess();
        }
      }
      // if (response.data === "Theatre Added Successfully!") {
      //   setTheaterData({
      //   name: "",
      //   areaType: "THEATRE",
      //   status: "PERMANENT",
      //   totalCapacity: 0,
      //   openAreaPrice: 0,
      //   seatTypes: [{ typeName: "VIP", totalSeats: 30, seatsPerRow: 15 }],
      // });
      // }
    } catch (err) {
      console.log(err);
    }
  };

  const renderTheaterPreview = () => {
    const seatTypeColors = {
      VIP: "bg-amber-500",
      Normal: "bg-blue-500",
      Premium: "bg-purple-500",
      Economy: "bg-green-500",
    };

    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Theater Preview</h3>
        </div>

        {/* Screen */}
        <div className="bg-gray-300 h-3 rounded-full mb-6 relative">
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            STAGE
          </div>
        </div>

        {/* Seats Layout */}
        <div className="space-y-4">
          {theaterData.seatTypes.map((seatType, typeIndex) => {
            if (!seatType.typeName || seatType.totalSeats === 0) return null;

            const rows = Math.ceil(seatType.totalSeats / seatType.seatsPerRow);
            const color = seatTypeColors[seatType.typeName] || "bg-gray-500";

            return (
              <div key={typeIndex} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${color}`}></div>
                  <span>
                    {seatType.typeName} ({seatType.totalSeats} seats)
                  </span>
                </div>

                {Array.from({ length: rows }).map((_, rowIndex) => {
                  const seatsInThisRow = Math.min(
                    seatType.seatsPerRow,
                    seatType.totalSeats - rowIndex * seatType.seatsPerRow
                  );

                  return (
                    <div key={rowIndex} className="flex justify-center gap-1">
                      {Array.from({ length: seatsInThisRow }).map(
                        (_, seatIndex) => (
                          <div
                            key={seatIndex}
                            className={`w-4 h-4 rounded-sm ${color} opacity-80`}
                          />
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Seat Types:</div>
          <div className="flex flex-wrap gap-3">
            {theaterData.seatTypes.map(
              (seatType, index) =>
                seatType.typeName && (
                  <div key={index} className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded ${
                        seatTypeColors[seatType.typeName] || "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-xs">{seatType.typeName}</span>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="p-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Add New Theater
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theater Name
                  </label>
                  <input
                    type="text"
                    required
                    value={theaterData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter theater name"
                  />
                </div>
              </div>
            </div>

            {/* Seat Configuration */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Seat Configuration
                </h2>
                <button
                  onClick={addSeatType}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Seat Type
                </button>
              </div>

              <div className="space-y-4">
                {theaterData.seatTypes.map((seatType, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Seat Type {index + 1}
                      </h3>
                      {theaterData.seatTypes.length > 1 && (
                        <button
                          onClick={() => removeSeatType(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type Name
                        </label>
                        <input
                          type="text"
                          value={seatType.typeName}
                          onChange={(e) =>
                            handleSeatTypeChange(
                              index,
                              "typeName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., VIP, Normal"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Seats
                        </label>
                        <input
                          type="number"
                          value={seatType.totalSeats}
                          onChange={(e) =>
                            handleSeatTypeChange(
                              index,
                              "totalSeats",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seats Per Row
                        </label>
                        <input
                          type="number"
                          value={seatType.seatsPerRow}
                          onChange={(e) =>
                            handleSeatTypeChange(
                              index,
                              "seatsPerRow",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6 ms-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>

            {showPreview && renderTheaterPreview()}

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Theater Name:</span>
                  <span className="font-medium">
                    {theaterData.name || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Capacity:</span>
                  <span className="font-medium">
                    {theaterData.seatTypes.reduce(
                      (sum, type) => sum + type.totalSeats,
                      0
                    )}{" "}
                    seats
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Types:</span>
                  <span className="font-medium">
                    {theaterData.seatTypes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!theaterData.name.trim()}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
             {theatreToEdit ? "Update Theater" : "Submit Theater Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTheatre;
