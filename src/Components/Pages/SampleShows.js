// // Sample data for theater shows with enhanced seat booking functionality
// export const sampleShows = [
//   {
//     id: '1',
//     title: 'Mama Nemeyi Wena Kenek – Colombo Premiere',
//     dramaName: 'Mama Nemeyi Wena Kenek',
//     dramaId: '1',
//     date: 'Fri, 18 Nov 2025',
//     dateDetails: 'Nov 18, 2025, 7:00 PM',
//     time: '7:00 PM',
//     duration: '1 hr 30 min',
//     venue: {
//       name: "Bishop's College Auditorium",
//       location: 'Colombo 3',
//       address: '61 Bauddhaloka Mawatha, Colombo 00400',
//       capacity: 250,
//       facilities: ['Air Conditioning', 'Parking', 'Wheelchair Access']
//     },
//     description: "A powerful stage drama about a mother's struggle in modern society. This heartfelt story explores family dynamics and social pressures with exceptional performances.",
//     image: 'drama7.jpg',
//     ticketPrices: [
//       {
//         category: 'VIP',
//         price: 'LKR 1,500',
//         available: true,
//         description: 'Front row seats with complimentary refreshments',
//         totalSeats: 30,
//         availableSeats: 25,
//         seatsPerRow:8
//       },
//       {
//         category: 'Premium',
//         price: 'LKR 1,000',
//         available: true,
//         description: 'Best view seats in the center section',
//         totalSeats: 70,
//         seatsPerRow: 10
//       },
//       // {
//       //   category: 'Standard',
//       //   price: 'LKR 600',
//       //   available: true,
//       //   description: 'Good view seats with comfortable seating',
//       //   totalSeats: 100,
//       //   availableSeats: 85
//       // },
//       // {
//       //   category: 'Balcony',
//       //   price: 'LKR 400',
//       //   available: false,
//       //   description: 'Upper level seating - Currently unavailable',
//       //   totalSeats: 40,
//       //   availableSeats: 0
//       // }
//     ],
//     organizer: {
//       name: 'Colombo Drama Society',
//       email: 'info@colombodrama.lk',
//       contact: '+94 77 123 4567',
//       website: 'www.colombodrama.lk'
//     },
//     status: 'active',
//     genre: 'Drama',
//     language: 'Sinhala',
//     ageRating: '13+',
//     cast: ['Sanath Gunathilake', 'Nita Fernando', 'Roshan Ravindra'],
//     director: 'Jayantha Chandrasiri',
//     bookingOpenDate: '2025-10-01',
//     showType: 'theater'
//   },
//   {
//     id: '3',
//     title: 'Pirimiekgen Paminillak – Matara Grand Show',
//     dramaName: 'Pirimiekgen Paminillak',
//     dramaId: '2',
//     date: 'Fri, 15 Aug 2025',
//     dateDetails: 'Nov 25, 2025, 6:30 PM',
//     time: '6:30 PM',
//     duration: '2 hrs',
//     venue: {
//       name: 'Matara Grand Show',
//       location: 'Gampaha',
//       address: '18 Guildford Crescent, Colombo 00700',
//       capacity: 600,
//       facilities: ['Premium Sound System', 'Orchestra Pit', 'VIP Lounge', 'Parking']
//     },
//     description: 'A captivating musical drama featuring live orchestra and exceptional vocal performances. Experience love, loss, and redemption through powerful songs.',
//     image: '/assets/drama8.jpg',

//     ticketPrices: [
//       {
//         category: 'VIP',
//         price: 'LKR 1,500',
//         available: true,
//         description: 'Front row seats with complimentary refreshments',
//         totalSeats: 30,
//         availableSeats: 25,
//         seatsPerRow:8
//       },
//       {
//         category: 'Premium',
//         price: 'LKR 1,000',
//         available: true,
//         description: 'Best view seats in the center section',
//         totalSeats: 70,
//         availableSeats: 72,
//         seatsPerRow: 10
//       },
//       // {
//       //   category: 'Standard',
//       //   price: 'LKR 600',
//       //   available: true,
//       //   description: 'Good view seats with comfortable seating',
//       //   totalSeats: 100,
//       //   availableSeats: 85
//       // },
//       // {
//       //   category: 'Balcony',
//       //   price: 'LKR 400',
//       //   available: false,
//       //   description: 'Upper level seating - Currently unavailable',
//       //   totalSeats: 40,
//       //   availableSeats: 0
//       // }
//     ],
//     organizer: {
//       name: 'Colombo Drama Society',
//       email: 'info@colombodrama.lk',
//       contact: '+94 77 123 4567',
//       website: 'www.colombodrama.lk'
//     },
//     status: 'active',
//     genre: 'Drama',
//     language: 'Sinhala',
//     ageRating: '13+',
//     cast: ['Sanath Gunathilake', 'Nita Fernando', 'Roshan Ravindra'],
//     director: 'Jayantha Chandrasiri',
//     bookingOpenDate: '2025-10-01',
//     showType: 'theater'
//   },
//   {
//     id: '2',
//     title: 'Rathu Rosa – Classic Revival',
//     dramaName: 'Rathu Rosa',
//     dramaId: '3',
//     date: 'Sun, 03 Dec 2025',
//     dateDetails: 'Dec 03, 2025, 7:00 PM',
//     time: '7:00 PM',
//     duration: '1 hr 45 min',
//     venue: {
//       name: 'Namel Malini Punchi Theatre',
//       location: 'Borella',
//       address: 'Borella Junction, Colombo 08',
//       capacity: 180,
//       facilities: ['Traditional Stage', 'Tea Counter', 'Street Parking']
//     },
//     description: 'A timeless Sri Lankan classic returns with fresh interpretations. This beloved story of love and sacrifice resonates across generations.',
//     image: '/assets/drama11.jpg',
//     ticketPrices: [
//       {
//         category: 'VIP',
//         price: 'LKR 1,200',
//         available: true,
//         description: 'Front section reserved seating',
//         totalSeats: 40,
//         availableSeats: 35
//       },
//       {
//         category: 'Premium',
//         price: 'LKR 800',
//         available: true,
//         description: 'Center section with optimal viewing',
//         totalSeats: 80,
//         availableSeats: 75
//       },
//       // {
//       //   category: 'Standard',
//       //   price: 'LKR 500',
//       //   available: true,
//       //   description: 'Rear section affordable seating',
//       //   totalSeats: 60,
//       //   availableSeats: 50
//       // }
//     ],
//     organizer: {
//       name: 'Heritage Theatre Group',
//       email: 'contact@heritagetheatre.lk',
//       contact: '+94 78 987 6543',
//       website: 'www.heritagetheatre.lk'
//     },
//     status: 'active',
//     genre: 'Classic Drama',
//     language: 'Sinhala',
//     ageRating: '16+',
//     cast: ['Jackson Anthony', 'Malini Fonseka', 'Ravindra Randeniya'],
//     director: 'Lester James Peries',
//     bookingOpenDate: '2025-09-20',
//     showType: 'theater'
//   },

// ];

// // Enhanced utility functions for seat booking system
// export const getShowsById = (id) => {
//   return sampleShows.find(show => show.id === id);
// };

// export const getAllShows = () => {
//   return sampleShows;
// };

// export const getActiveShows = () => {
//   return sampleShows.filter(show => show.status === 'active');
// };

// export const getShowsByGenre = (genre) => {
//   return sampleShows.filter(show => 
//     show.genre.toLowerCase().includes(genre.toLowerCase())
//   );
// };

// export const getShowsByVenue = (venueName) => {
//   return sampleShows.filter(show => 
//     show.venue.name.toLowerCase().includes(venueName.toLowerCase())
//   );
// };

// export const searchShows = (searchTerm) => {
//   if (!searchTerm) return sampleShows;
  
//   const term = searchTerm.toLowerCase();
//   return sampleShows.filter(show => 
//     show.title.toLowerCase().includes(term) ||
//     show.dramaName.toLowerCase().includes(term) ||
//     show.venue.name.toLowerCase().includes(term) ||
//     show.genre.toLowerCase().includes(term) ||
//     show.cast.some(actor => actor.toLowerCase().includes(term)) ||
//     show.director.toLowerCase().includes(term)
//   );
// };

// export const getShowsByDateRange = (startDate, endDate) => {
//   // In a real app, you'd properly parse and compare dates
//   return sampleShows.filter(show => show.status === 'active');
// };

// export const getShowsByPriceRange = (minPrice, maxPrice) => {
//   return sampleShows.filter(show => {
//     const prices = show.ticketPrices
//       .filter(ticket => ticket.available)
//       .map(ticket => parseInt(ticket.price.replace(/[^\d]/g, '')));
    
//     const minShowPrice = Math.min(...prices);
//     const maxShowPrice = Math.max(...prices);
    
//     return minShowPrice >= minPrice && maxShowPrice <= maxPrice;
//   });
// };

// export const getAvailableSeatsCount = (showId) => {
//   const show = getShowById(showId);
//   if (!show) return 0;
  
//   return show.ticketPrices
//     .filter(ticket => ticket.available)
//     .reduce((total, ticket) => total + ticket.availableSeats, 0);
// };

// export const getTicketCategories = (showId) => {
//   const show = getShowById(showId);
//   if (!show) return [];
  
//   return show.ticketPrices.filter(ticket => ticket.available);
// };

// // Seat management utilities
// export const generateSeatLayout = (show) => {
//   if (!show?.ticketPrices) return [];
  
//   let seatId = 1;
//   const allSeats = [];
  
//   show.ticketPrices.forEach((ticketCategory, categoryIndex) => {
//     if (!ticketCategory.available) return;
    
//     const price = parseInt(ticketCategory.price.replace(/[^\d]/g, ''));
//     const category = ticketCategory.category;
//     const totalSeats = ticketCategory.totalSeats;
    
//     // Check if this is an open area (no assigned seats)
//     if (isOpenArea(category)) {
//       // Don't generate individual seats for open areas
//       return;
//     }
    
//     // Calculate seats per row based on category
//     let seatsPerRow, startY;
    
//     switch (category.toLowerCase()) {
//       case 'vip':
//         seatsPerRow = 10;
//         startY = 50 + (categoryIndex * 120);
//         break;
//       case 'premium':
//         seatsPerRow = 15;
//         startY = 50 + (categoryIndex * 120);
//         break;
//       case 'standard':
//         seatsPerRow = 20;
//         startY = 50 + (categoryIndex * 120);
//         break;
//       case 'balcony':
//         seatsPerRow = 12;
//         startY = 50 + (categoryIndex * 120);
//         break;
//       default:
//         seatsPerRow = 15;
//         startY = 50 + (categoryIndex * 120);
//     }
    
//     for (let i = 0; i < totalSeats; i++) {
//       const rowNumber = Math.floor(i / seatsPerRow);
//       const row = String.fromCharCode(65 + rowNumber + (categoryIndex * 4));
      
//       const seat = {
//         id: seatId++,
//         row: row,
//         number: (i % seatsPerRow) + 1,
//         price: price,
//         status: Math.random() > 0.8 ? 'BOOKED' : 'AVAILABLE', // 20% booked
//         seatType: category,
//         category: category,
//         positionX: 80 + (i % seatsPerRow) * 40,
//         positionY: startY + rowNumber * 45
//       };
//       allSeats.push(seat);
//     }
//   });
  
//   return allSeats;
// };

// // Open Area Management Functions
// export const isOpenArea = (category) => {
//   const openAreaCategories = [
//     'standing', 'lawn', 'general admission', 'open area', 
//     'standing room', 'ga', 'pit', 'floor', 'dance floor'
//   ];
//   return openAreaCategories.some(openCat => 
//     category.toLowerCase().includes(openCat.toLowerCase())
//   );
// };

// export const getOpenAreas = (show) => {
//   if (!show?.ticketPrices) return [];
  
//   return show.ticketPrices.filter(ticket => 
//     ticket.available && isOpenArea(ticket.category)
//   );
// };

// export const getSeatedAreas = (show) => {
//   if (!show?.ticketPrices) return [];
  
//   return show.ticketPrices.filter(ticket => 
//     ticket.available && !isOpenArea(ticket.category)
//   );
// };

// export const handleOpenAreaBooking = (show, openAreaCategory, quantity) => {
//   const openArea = show.ticketPrices.find(ticket => 
//     ticket.category === openAreaCategory && ticket.available
//   );
  
//   if (!openArea) {
//     return {
//       success: false,
//       error: 'Open area not found or not available'
//     };
//   }
  
//   if (quantity > openArea.availableSeats) {
//     return {
//       success: false,
//       error: `Only ${openArea.availableSeats} tickets available`
//     };
//   }
  
//   const price = parseInt(openArea.price.replace(/[^\d]/g, ''));
//   const totalPrice = price * quantity;
  
//   return {
//     success: true,
//     booking: {
//       category: openArea.category,
//       quantity: quantity,
//       pricePerTicket: price,
//       totalPrice: totalPrice,
//       description: openArea.description,
//       isOpenArea: true
//     }
//   };
// };

// export const generateOpenAreaTickets = (openAreaBooking) => {
//   const tickets = [];
  
//   for (let i = 1; i <= openAreaBooking.quantity; i++) {
//     tickets.push({
//       id: `open-${openAreaBooking.category.toLowerCase().replace(/\s+/g, '-')}-${i}`,
//       category: openAreaBooking.category,
//       ticketNumber: i,
//       price: openAreaBooking.pricePerTicket,
//       type: 'open_area',
//       description: openAreaBooking.description,
//       seatInfo: 'General Admission - No assigned seat'
//     });
//   }
  
//   return tickets;
// };

// // Booking utilities
// export const calculateTotalPrice = (selectedSeats) => {
//   return selectedSeats.reduce((total, seat) => total + seat.price, 0);
// };

// export const formatPrice = (price) => {
//   return `LKR ${price.toLocaleString()}`;
// };

// export const validateBookingData = (bookingData) => {
//   const errors = [];
  
//   if (!bookingData.customer.name) errors.push('Name is required');
//   if (!bookingData.customer.email) errors.push('Email is required');
//   if (!bookingData.customer.phone) errors.push('Phone number is required');
//   if (!bookingData.seats || bookingData.seats.length === 0) errors.push('At least one seat must be selected');
  
//   return {
//     isValid: errors.length === 0,
//     errors: errors
//   };
// };