import React from "react";

const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";

export default function GoogleLoginButton() {
  return (
    <a href={GOOGLE_AUTH_URL} style={{ textDecoration: "none" }}>
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          margin:"5px",
          padding: "10px",
          backgroundColor: "#fff",
          color: "#555",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontWeight: "500",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgb(0 0 0 / 0.1)",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eee")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
      >
        <svg
          style={{ marginRight: "8px" }}
          width="18"
          height="18"
          viewBox="0 0 533.5 544.3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285f4"
            d="M533.5 278.4c0-18.5-1.5-36.4-4.4-53.8H272v101.8h146.9c-6.3 34-25 62.9-53.6 82.2v68h86.6c50.7-46.7 79.6-115.4 79.6-198.2z"
          />
          <path
            fill="#34a853"
            d="M272 544.3c72.4 0 133.3-23.8 177.8-64.6l-86.6-68c-24 16.2-54.6 25.8-91.2 25.8-70 0-129.3-47.3-150.6-111.3H34.4v69.9C78.5 491 168.1 544.3 272 544.3z"
          />
          <path
            fill="#fbbc04"
            d="M121.4 322.2c-5.3-15.8-8.3-32.6-8.3-49.8s3-34 8.3-49.8v-69.9H34.4c-17.8 35.8-28 75.9-28 119.7s10.2 83.9 28 119.7l87-69.7z"
          />
          <path
            fill="#ea4335"
            d="M272 107.7c39.4 0 74.7 13.6 102.5 40.3l76.9-76.9C403 24 345.3 0 272 0 168.1 0 78.5 53.3 34.4 135.9l87 69.7c21.3-64 80.6-111.3 150.6-111.3z"
          />
        </svg>
        Sign in with Google
      </button>
    </a>
  );
}
