// Sample data for shows
export const sampleShows = [
  {
    id: '1',
    title: 'Mama Nemeyi Wena Kenek – Colombo Premiere',
    dramaName: 'Mama Nemeyi Wena Kenek',
    dramaId: '1',
    date: 'Fri, 18 Nov 2025',
    dateDetails: 'Nov 18, 2022, 7:00 PM',
    time: '7:00 pm',
    duration: '1 hr 30 min',
    venue: {
      name: "Bishop's College",
      location: 'Auditorium'
    },
    description: "Opening night for the powerful stage drama about a mother's struggle, performed live in Colombo.",
    image: 'drama7.jpg',
    ticketPrices: [
      {
        category: 'VIP',
        price: 800,
        available: true
      },
      {
        category: 'Normal',
        price: 500,
        available: true
      },
      {
        category: 'Standing',
        price: 0,
        available: false
      }
    ],
    organizer: {
      name: 'Colombo Premiere',
      email: 'colombopremiere@gmail.com',
      contact: '0789362885'
    },
    status: 'active'
  },
  {
    id: '2',
    title: 'Subha Saha – Musical Drama',
    dramaName: 'Subha Saha',
    dramaId: '2',
    date: 'Sat, 25 Nov 2025',
    dateDetails: 'Nov 25, 2025, 6:30 PM',
    time: '6:30 pm',
    duration: '2 hrs',
    venue: {
      name: 'Lionel Wendt Theatre',
      location: 'Colombo 7'
    },
    description: 'A captivating musical drama that explores themes of love, loss, and redemption through powerful performances.',
    image: 'drama8.png',
    ticketPrices: [
      {
        category: 'VIP',
        price: 1200,
        available: true
      },
      {
        category: 'Normal',
        price: 800,
        available: true
      },
      {
        category: 'Standing',
        price: 400,
        available: true
      }
    ],
    organizer: {
      name: 'Theatre Arts Colombo',
      email: 'info@theatrearts.lk',
      contact: '0112345678'
    },
    status: 'active'
  },
  {
    id: '3',
    title: 'Rathu Rosa – Classic Revival',
    dramaName: 'Rathu Rosa',
    dramaId: '3',
    date: 'Sun, 03 Dec 2025',
    dateDetails: 'Dec 03, 2025, 7:00 PM',
    time: '7:00 pm',
    duration: '1 hr 45 min',
    venue: {
      name: 'Namel Malini Punchi Theatre',
      location: 'Borella'
    },
    description: 'A classic Sri Lankan drama returns to the stage with a fresh perspective on timeless themes.',
    image: 'drama11.jpg',
    ticketPrices: [
      {
        category: 'VIP',
        price: 1000,
        available: true
      },
      {
        category: 'Normal',
        price: 600,
        available: true
      },
      {
        category: 'Standing',
        price: 300,
        available: false
      }
    ],
    organizer: {
      name: 'Classic Theatre Society',
      email: 'contact@classictheatre.lk',
      contact: '0776543210'
    },
    status: 'active'
  },
  {
    id: '4',
    title: 'Kalu Sudu – Contemporary Drama',
    dramaName: 'Kalu Sudu',
    dramaId: '4',
    date: 'Fri, 08 Dec 2025',
    dateDetails: 'Dec 08, 2025, 8:00 PM',
    time: '8:00 pm',
    duration: '2 hrs 15 min',
    venue: {
      name: 'John De Silva Theatre',
      location: 'Colombo 7'
    },
    description: 'A thought-provoking contemporary drama that challenges social norms and explores modern relationships.',
    image: '/assets/drama4.jpg',
    ticketPrices: [
      {
        category: 'VIP',
        price: 1500,
        available: true
      },
      {
        category: 'Normal',
        price: 1000,
        available: true
      },
      {
        category: 'Standing',
        price: 500,
        available: true
      }
    ],
    organizer: {
      name: 'Modern Drama Collective',
      email: 'hello@moderndrama.lk',
      contact: '0771234567'
    },
    status: 'active'
  },
  {
    id: '5',
    title: 'Sanda Kinduru – Family Drama',
    dramaName: 'Sanda Kinduru',
    dramaId: '5',
    date: 'Sat, 16 Dec 2025',
    dateDetails: 'Dec 16, 2025, 6:00 PM',
    time: '6:00 pm',
    duration: '1 hr 20 min',
    venue: {
      name: 'Elphinstone Theatre',
      location: 'Maradana'
    },
    description: 'A heartwarming family drama that celebrates the bonds of love and unity across generations.',
    image: '/assets/drama5.jpg',
    ticketPrices: [
      {
        category: 'VIP',
        price: 900,
        available: true
      },
      {
        category: 'Normal',
        price: 550,
        available: true
      },
      {
        category: 'Standing',
        price: 250,
        available: true
      }
    ],
    organizer: {
      name: 'Family Theatre Productions',
      email: 'info@familytheatre.lk',
      contact: '0789876543'
    },
    status: 'active'
  }
];

// Function to get show by ID
export const getShowById = (id) => {
  return sampleShows.find(show => show.id === id);
};

// Function to get all shows
export const getAllShows = () => {
  return sampleShows;
};

// Function to get shows by status
export const getShowsByStatus = (status) => {
  return sampleShows.filter(show => show.status === status);
};

// Function to search shows by title
export const searchShows = (searchTerm) => {
  if (!searchTerm) return sampleShows;
  
  return sampleShows.filter(show => 
    show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.dramaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Function to get shows by organizer
export const getShowsByOrganizer = (organizerName) => {
  return sampleShows.filter(show => 
    show.organizer.name.toLowerCase().includes(organizerName.toLowerCase())
  );
};

// Function to get upcoming shows (for future use)
export const getUpcomingShows = () => {
  const today = new Date();
  return sampleShows.filter(show => {
    // This is a simplified check - in real app, you'd parse the actual date
    return show.status === 'active';
  });
};