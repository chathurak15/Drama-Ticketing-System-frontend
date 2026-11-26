export const getThemeConfig = async () => {
  try {
    const res = await fetch("/api/theme");
    if (!res.ok) throw new Error("Failed to load theme");
    return await res.json();
  } catch (err) {
    return {
      brand: "Nataka.LK",
      developedBy: "Zeylex",
      theme: {
        primary: "#661F19",
        accent: "#FED800",
        accentGold: "#D97706",
        secondary: "#373333",
        backgroundDark: "#0d0d12",
      },
      logo: {
        white: "/logo-nataka-white.png",
        colored: "/logo-nataka.png",
      },
    };
  }
};
