import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { getShowById } from './SampleShows.js';

const ShowDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const showData = getShowById(id);
        if (!showData) {
          setError('Show not found');
        } else {
          setShow(showData);

          if(showData?.title) {
            document.title = `${showData.title}`;
          }
          
          if (showData?.image) {
            import(`../../assets/${showData.image}`)
            .then(module => setImageSrc(module.default))
            .catch(() => setImageSrc('/images/default-show.jpg')); // fallback
            }
        }
      } catch (err) {
        setError('Failed to load show details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShowDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading show details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !show) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Show Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested show could not be found.'}</p>
            <button 
              onClick={() => window.history.back()} 
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Main Content */}
      <main className="min-h-screen">
        <div className="container  px-4 py-8">
          {/* Show Details Card */}
          <div className="lg:w-4/4 rounded-2xl shadow-lg overflow-hidden my-12">
            <div className="flex flex-col lg:flex-row">
              {/* Poster Image */}
              <div className="lg:w-1/4 p-0 h-90 flex items-center justify-center">
                <img 
                  src = {imageSrc}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Show Information */}
              <div className="lg:w-3/4 p-10 flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {show.title}
                </h1>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {/* Date */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{show.date}</p>
                      <p className="text-sm text-gray-500">{show.dateDetails}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{show.time}</p>
                      <p className="text-sm text-gray-500">Duration: {show.duration}</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{show.venue.name}</p>
                      <p className="text-sm text-gray-500">{show.venue.location}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  {show.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-left gap-10">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Drama Name:</span>
                    <a href={`/drama/${show.dramaId}`} className="text-amber-900 font-semibold hover:underline">
                      {show.dramaName}
                    </a>
                  </div>
                  <button className="booking-btn text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors">
                    Book Your Seat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Show Information Section */}
          <h2 className="text-2xl font-bold text-gray-900 mb-0 mt-6">Show Information</h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-15 flex items-center">
           
            {/* Ticket Pricing */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Ticket Price</h3>
                <div className="space-y-3 mb-6">
                  {show.ticketPrices.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{ticket.category}</span>
                      <span className={`font-bold ${ticket.available ? '' : 'text-red-600'}`}>
                        : {ticket.available ? `${ticket.price} LKR` : 'Not Available'}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full booking-btn text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors">
                  Book Your Seat
                </button>
              </div>
            </div>

            {/* Organizer Info */}
            <div>
              <div className="showDetails-card rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Organize By: <span className="text-amber-900">{show.organizer.name}</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-mb">
                    <span className="font-bold">Email:</span> {show.organizer.email}
                  </p>
                  <p className="text-mb">
                    <span className="font-bold">Contact Number:</span> {show.organizer.contact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ShowDetails;