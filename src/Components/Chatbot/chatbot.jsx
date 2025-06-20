import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, User, Bot, Star, Calendar, MapPin, CreditCard, LogIn } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const messagesEndRef = useRef(null);

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock authentication - replace with your Spring Boot API
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginData.email || !loginData.password) return;
    
    try {
      // Replace with actual Spring Boot API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(loginData)
      // });
      
      // Mock successful login
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser({ name: 'Theater Lover', email: loginData.email });
        setShowLogin(false);
        setMessages([
          {
            id: 1,
            text: `Welcome to Nataka.lk! I'm your drama assistant. I can help you with:\n\n🎪 Find upcoming shows\n🎟️ Book tickets\n📍 Theater locations\n⭐ Show reviews\n💳 Payment assistance\n\nWhat would you like to explore today?`,
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Mock API call to Spring Boot - replace with actual endpoints
  const sendMessageToAPI = async (message) => {
    try {
      // Replace with your Spring Boot API endpoint
      // const response = await fetch('/api/chat/message', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}`
      //   },
      //   body: JSON.stringify({ message, userId: user.id })
      // });
      // return await response.json();

      // Mock responses for demonstration
      const mockResponses = {
        'upcoming shows': 'Here are the upcoming shows:\n\n🌟 "Sinhabahu" - Dec 25, 2024 at Lionel Wendt Theatre\n🎪 "Maname" - Dec 28, 2024 at Elphinstone Theatre\n🎨 "Guru Tharuwa" - Jan 5, 2025 at BMICH\n\nWould you like to book tickets for any of these?',
        'book ticket': 'Great! Which show would you like to book?\n\n1. Sinhabahu - LKR 2,500\n2. Maname - LKR 2,000  \n3. Guru Tharuwa - LKR 3,000\n\nJust tell me the show name and number of tickets!',
        'payment': 'We accept:\n\n🏦 Visa/Mastercard\n📱 Mobile payments (Dialog, Mobitel)\n🏛️ Bank transfers\n💰 Cash at venue\n\nAll payments are secure and encrypted!',
        'location': 'Our partner theaters:\n\n🎭 Lionel Wendt Theatre - Colombo 7\n🎪 Elphinstone Theatre - Colombo 8\n🏛️ BMICH - Colombo 7\n🎨 Tower Hall Theatre - Colombo 4\n\nNeed directions to any venue?'
      };

      const response = mockResponses[message.toLowerCase()] || 
        `I understand you're asking about "${message}". Let me connect you with our booking system for personalized assistance! \n\nTry asking about:\n• "upcoming shows"\n• "book ticket"\n• "payment options"\n• "theater locations"`;

      return { reply: response };
    } catch (error) {
      return { reply: ' orry, I\'m having trouble connecting right now. Please try again!' };
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate API call
    setTimeout(async () => {
      const apiResponse = await sendMessageToAPI(inputValue);
      const botMessage = {
        id: messages.length + 2,
        text: apiResponse.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const LoginForm = () => (
    <div className="p-6 bg-white">
      <div className="text-center mb-4">
        <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-3">
          <img src='/public/images/logo nataka.png'></img>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Welcome to Nataka.lk</h3>
        <p className="text-gray-600 text-sm mt-1">Sign in to chat with our drama assistant</p>
      </div>
      
      <div className="space-y-4 ">
        <div>
          <input
            type="email"
            placeholder="Email address"
            value={loginData.email}
            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full booking-btn text-white py-3 rounded-lg hover:from-red-900 hover:to-red-700 transition-all duration-300 font-medium"
        >
          Sign In
        </button>
        <p className="text-center text-sm text-gray-600">
          New to Nataka.lk? <span className="text-red-600 cursor-pointer hover:underline">Create account</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Chat Widget */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-100 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="booking-btn p-2 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <img src='/public/images/logo nataka.png' className='w-8'></img>
                </div>
                <div>
                  <h3 className="font-semibold">Nataka Assistant</h3>
                  <p className="text-xs text-red-100">Your drama booking helper</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isAuthenticated ? (
            <LoginForm />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-red-50 to-white ">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-100 text-white w-15 h-12 rounded-full flex items-center justify-center p-2'
                      }`}>
                        {message.sender === 'user' ? <User size={16} /> : <img src='/public/images/logo nataka.png'></img>}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-red-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
                        
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    placeholder="Ask about shows, tickets, or venues..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-full hover:from-red-900 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['upcoming shows', 'book ticket', 'payment', 'location'].map((action) => (
                    <button
                      key={action}
                      onClick={() => setInputValue(action)}
                      className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors duration-200 border border-red-200"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-full shadow-2xl hover:from-red-900 hover:to-red-700 transition-all duration-300 flex items-center justify-center group hover:scale-110"
      >
        {isOpen ? (
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center">
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform duration-300" />
            {!isAuthenticated && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <LogIn size={12} className="text-white" />
              </div>
            )}
          </div>
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && !isAuthenticated && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </div>
      )}
    </div>
  );
};

export default Chatbot;