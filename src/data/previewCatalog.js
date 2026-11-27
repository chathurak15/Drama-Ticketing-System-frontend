export const PREVIEW_SHOWS = [
  {
    showId: "preview-1",
    id: "preview-1",
    title: "නරි බෑනා (Nari Bena)",
    slug: "nari-bena-lionel-wendt",
    location: "Lionel Wendt Memorial Theatre",
    city: { cityName: "Colombo 07" },
    showDate: "2026-12-15",
    showTime: "06:30 PM",
    startingPrice: 1000,
    status: "approved",
    description: "A celebrated Sinhala comedy-drama exploring the cunning fox's misadventures in village life, written by Dayananda Gunawardena.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    drama: {
      id: "drama-preview-1",
      title: "නරි බෑනා (Nari Bena)",
      description: "Dayananda Gunawardena's iconic masterpiece blending traditional theatrical styling with satirical commentary.",
      category: "Comedy / Musical"
    },
    theatre: {
      id: "theatre-wendt",
      name: "Lionel Wendt Memorial Theatre",
      areaType: "THEATRE"
    },
    ticketPrices: [
      { category: "VIP", price: 3500, totalSeats: 40, seatsPerRow: 20 },
      { category: "ODC Front", price: 2500, totalSeats: 75, seatsPerRow: 25 },
      { category: "ODC Standard", price: 1500, totalSeats: 100, seatsPerRow: 25 },
      { category: "Balcony", price: 1000, totalSeats: 60, seatsPerRow: 20 }
    ],
    seatTiers: [
      { name: "VIP", price: 3500, color: "#D4AF37", rows: ["A", "B"], seatsPerRow: 20 },
      { name: "ODC Front", price: 2500, color: "#2563eb", rows: ["C", "D", "E"], seatsPerRow: 25 },
      { name: "ODC Standard", price: 1500, color: "#16a34a", rows: ["F", "G", "H", "I"], seatsPerRow: 25 },
      { name: "Balcony", price: 1000, color: "#6b7280", rows: ["J", "K", "L"], seatsPerRow: 20 }
    ]
  },
  {
    showId: "preview-2",
    id: "preview-2",
    title: "ගජමන් පුවත (Gajaman Puwatha)",
    slug: "gajaman-puwatha-ymba",
    location: "YMBA Main Auditorium",
    city: { cityName: "Borella, Colombo" },
    showDate: "2026-12-20",
    showTime: "03:30 PM",
    startingPrice: 1000,
    status: "approved",
    description: "The legendary tale of Gajaman Nona — poetess, rebel, and icon of Sinhala literary heritage.",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
    drama: {
      id: "drama-preview-2",
      title: "ගජමන් පුවත (Gajaman Puwatha)",
      description: "A poignant biographical theatrical production depicting the life of poetess Gajaman Nona.",
      category: "Drama / Historical"
    },
    theatre: {
      id: "theatre-ymba",
      name: "YMBA Main Auditorium",
      areaType: "THEATRE"
    },
    ticketPrices: [
      { category: "Reserved Front", price: 3000, totalSeats: 44, seatsPerRow: 22 },
      { category: "Middle Hall", price: 2000, totalSeats: 96, seatsPerRow: 24 },
      { category: "Balcony", price: 1000, totalSeats: 60, seatsPerRow: 20 }
    ],
    seatTiers: [
      { name: "Reserved Front", price: 3000, color: "#D4AF37", rows: ["A", "B"], seatsPerRow: 22 },
      { name: "Middle Hall", price: 2000, color: "#2563eb", rows: ["C", "D", "E", "F"], seatsPerRow: 24 },
      { name: "Balcony", price: 1000, color: "#6b7280", rows: ["G", "H", "I"], seatsPerRow: 20 }
    ]
  }
];

export const isPreviewMode = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PREVIEW_MODE) {
    return process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
  }
  return false;
};

export const getPreviewShows = () => {
  return PREVIEW_SHOWS;
};

export const getPreviewShowById = (idOrSlug) => {
  if (!idOrSlug) return null;
  const target = String(idOrSlug).toLowerCase();
  return (
    PREVIEW_SHOWS.find(
      (s) =>
        String(s.showId).toLowerCase() === target ||
        String(s.id).toLowerCase() === target ||
        String(s.slug).toLowerCase() === target
    ) || null
  );
};

export const getPreviewSeatLayout = (idOrSlug) => {
  const show = getPreviewShowById(idOrSlug) || PREVIEW_SHOWS[0];
  const seats = [];

  show.seatTiers.forEach((tier) => {
    tier.rows.forEach((rowLetter) => {
      for (let num = 1; num <= tier.seatsPerRow; num++) {
        const seatId = `${rowLetter}${num}`;
        const isUnavailable = (num === 4 || num === 5) && (rowLetter === "A" || rowLetter === "C");
        seats.push({
          id: seatId,
          seatId: seatId,
          seatIdentifier: seatId,
          row: rowLetter,
          number: num,
          price: tier.price,
          category: tier.name,
          color: tier.color,
          isBooked: isUnavailable,
          isLocked: false,
          available: !isUnavailable
        });
      }
    });
  });

  return {
    showId: show.showId,
    title: show.title,
    showDate: show.showDate,
    showTime: show.showTime,
    location: show.location,
    theatre: show.theatre,
    ticketPrices: show.ticketPrices,
    seats: seats
  };
};

/**
 * Sample compliance preview receipt matching Visa & PAYable card-absent standards.
 * Used during preview mode (NEXT_PUBLIC_PREVIEW_MODE=true) or compliance review.
 */
export const getSamplePreviewReceipt = () => ({
  merchantLegalName: "Zeylex Digital Solutions (Naataka.lk)",
  businessRegistrationNumber: "POL/ELH/ESD/02/01/1941/2026",
  merchantAddress: "No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka",
  countryOfDomicile: "Sri Lanka",
  merchantOnlineAddress: "https://naataka.lk",
  orderNumber: "PREVIEW-ORD-2026-001",
  bookingReference: "WEN-001-C04-00192",
  transactionDate: "2026-11-27T01:10:19+05:30",
  formattedDateTime: "27 Nov 2026, 01:10:19 AM (+05:30)",
  buyerName: "Chathura Kavindu",
  buyerEmail: "buyer@naataka.lk",
  buyerMobile: "+94 77 123 4567",
  deliveryMethod: "Electronic Delivery — Instant QR E-Ticket (No physical shipping)",
  dramaTitleSinhala: "කැලණි පාලම",
  dramaTitleEnglish: "Kelani Palama",
  dramaTitleDisplay: "කැලණි පාලම (Kelani Palama)",
  theatreVenue: "Lionel Wendt Memorial Theatre",
  city: "Colombo 07",
  venueAndCity: "Lionel Wendt Memorial Theatre, Colombo 07",
  showDate: "2026-12-05",
  showTime: "06:30 PM",
  seatTierAndNumbers: "ODC Front — Seats C4, C5",
  seatCount: 2,
  seatNumbers: ["C4", "C5"],
  ticketSubtotalLkr: 3500.0,
  serviceFeeLkr: 227.5,
  grandTotalLkr: 3727.5,
  currency: "LKR",
  paymentMethodBrand: "Visa",
  maskedCardLast4: "4242",
  paymentMethodDisplay: "Visa ending in 4242",
  authorizationCode: "PREVIEW-AUTH-001",
  authorizationDate: "2026-11-27T01:10:19+05:30",
  authorizationDateFormatted: "27 Nov 2026, 01:10:19 AM (+05:30)",
  transactionType: "Purchase",
  policySummary:
    "Digital QR e-tickets are valid for single entry at the venue. Full ticket face-value refunds are issued to the original payment card within 5–7 working days if an event is cancelled or rescheduled by the organizer. Buyer cancellations are non-refundable within 24 hours of showtime. View full policy at https://naataka.lk/refund-policy.",
  policyUrl: "https://naataka.lk/refund-policy",
  customerServiceContact: "Customer Support: support@naataka.lk | hello@zeylex.com | Tel: +94 74 155 0909",
  customerSupportEmail: "support@naataka.lk",
  customerZeylexEmail: "hello@zeylex.com",
  customerSupportPhone: "+94 74 155 0909",
  isPreview: true,
  paymentStatus: "PAID",
});
