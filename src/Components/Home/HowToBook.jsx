import React from "react";
import useTranslation from "../../hooks/useTranslation";

const HowToBook = () => {
  const { translatedTexts } = useTranslation();

  const title = translatedTexts?.howToBook?.title || "How to Book A Ticket";
  const fallbackSteps = [
  "Browse Dramas – Search by category, city, or date",
  "Select Your Show – View details and choose your seat",
  "Make Payment – Pay securely online",
  "Get Your Ticket – Receive QR e-ticket via email/SMS",
  "Enjoy the Show – Scan your ticket at the entrance",
];

let stepsRaw = translatedTexts?.howToBook?.steps;
const steps = Array.isArray(stepsRaw) ? stepsRaw : fallbackSteps;


  return (
    <div className="c5">
      {/* Left: Steps */}
      <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
        <h2
          style={{
            fontSize: "40px",
            fontWeight: "bolder",
            marginBottom: "20px",
          }}
        >
          {title}
        </h2>
        <ol style={{ lineHeight: "1.8", fontSize: "20px", color: "black" }}>
          {steps.map((step, index) => (
            <li key={index}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Right: Video */}
      <div style={{ flex: "1 1 500px", minWidth: "300px" }}>
        <iframe
          src="https://www.youtube.com/embed/gTrEm2VqEl8"
          style={{
            width: "100%",
            height: "315px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "none",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Video"
        ></iframe>
      </div>
    </div>
  );
};

export default HowToBook;
