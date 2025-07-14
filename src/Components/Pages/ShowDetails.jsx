import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { getShowById } from "../../services/ShowService.js";
import SeatSelectionPopup from "./SeatPopup.jsx";
// import { getShowsById } from "./SampleShows.js";

const ShowDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const BACKEND_IMAGE_URL = "http://localhost:8080/uploads/shows/";

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to convert duration to readable format
  const formatDuration = (minutes) => {
    if (!minutes) return "Duration TBA";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Fetch drama details
        const showResponse = await getShowById(id);
        setShow(showResponse.data);

        // document.title = `${showResponse.data.title}`;

        // const seatData = getShowsById(id);
        // setShows(seatData);
      } catch (err) {
        setError("Failed to load show details");
        console.error("Error fetching show details:", err);
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
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading show details...</p>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Show Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested show could not be found."}
            </p>
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
        <div className="container mx-auto lg:px-18 py-0 mb-15">
          {/* Show Details Card */}
          <div className="lg:w-4/4 rounded-2xl shadow-lg overflow-hidden my-12">
            <div className="flex flex-col lg:flex-row">
              {/* Poster Image */}
              <div className="lg:w-1/4 p-0 h-100 flex items-center justify-center">
                <img
                  src={
                    show.image
                      ? `${BACKEND_IMAGE_URL}${show.image}`
                      : "/images/default.png"
                  }
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Show Information */}
              <div className="lg:w-3/4 p-10 ps-10 flex flex-col justify-center">
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
                      <p className="font-semibold text-gray-900">
                        {formatDate(show.showDate)}
                      </p>
                      <p className="text-sm text-gray-500">Show Date</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {show.showTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {formatDuration(show.drama?.duration)}
                      </p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {show.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        {show.city?.cityName}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  {show.description || show.drama?.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-left gap-10">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Drama:</span>
                    <a
                      href={`/drama/${show.drama?.id}`}
                      className="text-amber-900 font-semibold hover:underline"
                    >
                      {show.drama?.title}
                    </a>
                  </div>
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="booking-btn text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
                  >
                    Book Your Seat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Show Information Section */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-20">
            Show Information
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 mb-15">
            {/* Ticket Booking */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Ticket Booking</h3>
                <div className="space-y-3 mb-6">
                  <p className="text-gray-600">
                    Select your preferred seats and book your tickets for this
                    amazing show.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`font-bold capitalize ${
                        show.status === "approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {show.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">VIP:</span>
                    <span
                      className={`font-bold capitalize ${
                        show.status === "approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {show.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="w-full booking-btn text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
                >
                  Book Your Seat
                </button>
              </div>
            </div>

            {/* Organizer Info */}
            <div>
              <div className="showDetails-card rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    {show.user?.image ? (
                      <img
                        src={`/public/images/upload/user/${show.user.image}`}
                        alt="Organizer"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      Organized By:{" "}
                      <span className="text-amber-900">
                        {show.user?.fname}
                        {show.user?.lname && ` ${show.user.lname}`}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {show.user?.role?.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-bold">Email:</span> {show.user?.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold">Contact Number:</span>{" "}
                    {show.user?.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Drama Details Section */}
          {show.drama && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About the Drama
              </h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {show.drama.title}
                </h3>
                <p className="text-gray-600 mb-4">{show.drama.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(show.drama.duration)}
                    </span>
                  </div>
                  {show.drama.videoUrl && (
                    <a
                      href={show.drama.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                    >
                      Watch Trailer →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SeatSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        showId={id}
      />

      <Footer />
    </>
  );
};

export default ShowDetails;
