"use client";

import React from "react";
import TheatreCustomizerStudio from "./TheatreCustomizerStudio";

const AddTheatre = ({ theatreToEdit = null, onSuccess = () => {}, onCancel = null }) => {
  return (
    <div className="w-full">
      <TheatreCustomizerStudio
        theatreToEdit={theatreToEdit}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
};

export default AddTheatre;
