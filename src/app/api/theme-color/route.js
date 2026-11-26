import { NextResponse } from "next/server";

export async function GET() {
  const themeConfig = {
    status: "success",
    brand: "Nataka.LK",
    developedBy: "Zeylex",
    developerUrl: "https://zeylex.com",
    colors: {
      primary: "#661F19",
      primaryHover: "#832922",
      primaryDark: "#4A1410",
      accent: "#FED800",
      accentGold: "#D97706",
      secondary: "#373333",
      backgroundDark: "#0d0d12",
      cardDark: "#14141B",
      textLight: "#F8FAFC",
      textMuted: "#94A3B8",
    },
    logo: {
      white: "/logo-nataka-white.png",
      colored: "/logo-nataka.png",
    },
  };

  return NextResponse.json(themeConfig, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json",
    },
  });
}
