export default function manifest() {
  return {
    name: "eNataka.lk — Sri Lanka's Stage Drama Ticketing Platform",
    short_name: "eNataka",
    description: "Book tickets online for Sri Lanka's top stage dramas, theatre shows, and live cultural performances.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d12",
    theme_color: "#0d0d12",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
