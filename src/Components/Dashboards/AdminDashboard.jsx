import { authUtils } from '../../utils/authUtils';
import LogoutButton from '../Logout/LogoutButton';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Theater, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Sample data - in real app, this would come from your Spring Boot API
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeEvents: 15,
    pendingApprovals: 8,
    totalRevenue: 45000,
    monthlyGrowth: 12.5
  });

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Romeo and Juliet",
      organizer: "City Theater Group",
      date: "2025-07-15",
      venue: "Grand Theater",
      status: "pending",
      ticketsSold: 120,
      revenue: 2400
    },
    {
      id: 2,
      title: "Hamlet",
      organizer: "Shakespeare Society",
      date: "2025-07-20",
      venue: "Royal Hall",
      status: "approved",
      ticketsSold: 200,
      revenue: 5000
    },
    {
      id: 3,
      title: "The Tempest",
      organizer: "Modern Drama Co.",
      date: "2025-08-01",
      venue: "Arts Center",
      status: "rejected",
      ticketsSold: 0,
      revenue: 0
    }
  ]);

  const [dramas, setDramas] = useState([
    {
      id: 1,
      title: "Romeo and Juliet",
      genre: "Tragedy",
      duration: "2h 30m",
      cast: ["John Doe", "Jane Smith", "Mike Johnson"],
      director: "Sarah Wilson",
      description: "A timeless tale of love and tragedy"
    },
    {
      id: 2,
      title: "Hamlet",
      genre: "Tragedy",
      duration: "3h 15m",
      cast: ["Robert Brown", "Emily Davis", "Tom Wilson"],
      director: "David Miller",
      description: "The prince of Denmark's quest for revenge"
    }
  ]);

  const [actors, setActors] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-0123",
      experience: "5 years",
      specialties: ["Drama", "Comedy"],
      status: "active"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0124",
      experience: "8 years",
      specialties: ["Musical", "Drama"],
      status: "active"
    }
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Customer",
      joinDate: "2025-01-15",
      totalBookings: 5,
      status: "active"
    },
    {
      id: 2,
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "Organizer",
      joinDate: "2024-12-10",
      totalBookings: 0,
      status: "pending"
    }
  ]);

  // Handle event approval/rejection
  const handleEventAction = (eventId, action) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: action } : event
    ));
  };

  // Handle adding new items
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('');

  const StatCard = ({ title, value, icon: Icon, trend, color = "text-gray-600" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#661F19]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{trend}% from last month
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 text-[#661F19]" />
      </div>
    </div>
  );

  const TableRow = ({ children, className = "" }) => (
    <tr className={`border-b hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );

  const ActionButton = ({ icon: Icon, onClick, color = "text-gray-600", className = "" }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${color} ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={stats.monthlyGrowth}
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents}
          icon={Calendar}
          color="text-blue-600"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="text-orange-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-600"
          trend={15.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.organizer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'approved' ? 'bg-green-100 text-green-800' :
                  event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setAddType('event'); setShowAddModal(true); }}
              className="p-4 bg-[#661F19] text-white rounded-lg hover:bg-[#541612] transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => { setAddType('drama'); setShowAddModal(true); }}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Theater className="w-5 h-5" />
              <span>Add Drama</span>
            </button>
            <button
              onClick={() => { setAddType('actor'); setShowAddModal(true); }}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Add Actor</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Event Management</h2>
        <button
          onClick={() => { setAddType('event'); setShowAddModal(true); }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                />
              </div>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19]">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <TableRow key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.venue}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.organizer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'approved' ? 'bg-green-100 text-green-800' :
                      event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${event.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ActionButton icon={Eye} color="text-blue-600" />
                      <ActionButton icon={Edit} color="text-gray-600" />
                      {event.status === 'pending' && (
                        <>
                          <ActionButton
                            icon={CheckCircle}
                            onClick={() => handleEventAction(event.id, 'approved')}
                            color="text-green-600"
                          />
                          <ActionButton
                            icon={XCircle}
                            onClick={() => handleEventAction(event.id, 'rejected')}
                            color="text-red-600"
                          />
                        </>
                      )}
                      <ActionButton icon={Trash2} color="text-red-600" />
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDramas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Drama Management</h2>
        <button
          onClick={() => { setAddType('drama'); setShowAddModal(true); }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Drama</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dramas.map((drama) => (
          <div key={drama.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{drama.title}</h3>
                <div className="flex space-x-2">
                  <ActionButton icon={Edit} color="text-gray-600" />
                  <ActionButton icon={Trash2} color="text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600"><span className="font-medium">Genre:</span> {drama.genre}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {drama.duration}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Director:</span> {drama.director}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Cast:</span> {drama.cast.join(', ')}</p>
                <p className="text-sm text-gray-600 mt-3">{drama.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Actor Management</h2>
        <button
          onClick={() => { setAddType('actor'); setShowAddModal(true); }}
          className="bg-[#661F19] text-white px-4 py-2 rounded-lg hover:bg-[#541612] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Actor</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actors.map((actor) => (
                <TableRow key={actor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{actor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{actor.email}</div>
                    <div className="text-sm text-gray-500">{actor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{actor.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {actor.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      actor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {actor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ActionButton icon={Eye} color="text-blue-600" />
                      <ActionButton icon={Edit} color="text-gray-600" />
                      <ActionButton icon={Trash2} color="text-red-600" />
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalBookings}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ActionButton icon={Eye} color="text-blue-600" />
                      <ActionButton icon={Edit} color="text-gray-600" />
                      {user.status === 'pending' && (
                        <ActionButton icon={CheckCircle} color="text-green-600" />
                      )}
                      <ActionButton icon={Trash2} color="text-red-600" />
                    </div>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[12, 19, 15, 27, 22, 35, 28].map((height, idx) => (
              <div key={idx} className="bg-gradient-to-t from-[#661F19] to-[#b33529] rounded-t" style={{height: `${height * 2}px`, width: '40px'}}></div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Dramas</h3>
          <div className="space-y-4">
            {dramas.map((drama, idx) => (
              <div key={drama.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#661F19] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{drama.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">4.{8 - idx}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <TableRow>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#TXN001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Alice Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Romeo and Juliet</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$25.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-06-18</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </td>
              </TableRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AddModal = () => {
    const [formData, setFormData] = useState({});

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission here - connect to your Spring Boot API
      console.log('Form submitted:', formData);
      setShowAddModal(false);
      setFormData({});
    };

    const renderForm = () => {
      switch(addType) {
        case 'event':
          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter organizer name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter venue"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter event description"
                ></textarea>
              </div>
            </form>
          );
        case 'drama':
          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drama Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter drama title"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent">
                    <option>Select genre</option>
                    <option>Tragedy</option>
                    <option>Comedy</option>
                    <option>Drama</option>
                    <option>Musical</option>
                    <option>Historical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    placeholder="e.g., 2h 30m"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter director name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cast Members</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter cast members (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter drama description"
                ></textarea>
              </div>
            </form>
          );
        case 'actor':
          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="e.g., 5 years"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter specialties (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#661F19] focus:border-transparent"
                  placeholder="Enter actor bio"
                ></textarea>
              </div>
            </form>
          );
        default:
          return null;
      }
    };

    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Add New {addType?.charAt(0).toUpperCase() + addType?.slice(1)}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          {renderForm()}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#661F19] text-white rounded-lg hover:bg-[#541612]"
            >
              Add {addType?.charAt(0).toUpperCase() + addType?.slice(1)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'dramas', label: 'Dramas', icon: Theater },
    { key: 'actors', label: 'Actors', icon: UserCheck },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'events': return renderEvents();
      case 'dramas': return renderDramas();
      case 'actors': return renderActors();
      case 'users': return renderUsers();
      case 'analytics': return renderAnalytics();
      case 'payments': return (
        <div className="text-center py-20">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Payment Management</h3>
          <p className="text-gray-500">Connect your Spring Boot API to manage payments and transactions</p>
        </div>
      );
      case 'settings': return (
        <div className="text-center py-20">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">System Settings</h3>
          <p className="text-gray-500">Configure your platform settings and preferences</p>
        </div>
      );
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 booking-btn shadow-lg z-40">
        <div className="p-6 ">
          <div className="flex items-center space-x-3">
            <div>
              <img src='/public/images/logo nataka white.png'></img>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.key
                      ? 'bg-[#FED800] text-black'
                      : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-2">
          <div className="flex justify-between items-center">
            <div>
              {/* <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : `${activeTab} Management`}
              </h1> */}
              <p className="text-gray-600">Welcome back, Administrator</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-[#661F19] rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Add Modal */}
      <AddModal />
    </div>
  );
};

export default AdminDashboard;