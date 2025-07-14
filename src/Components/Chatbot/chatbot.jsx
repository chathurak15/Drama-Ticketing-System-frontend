import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, User, LogIn } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { getChatBot } from '../../services/ChatBotService';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAPI = async (message) => {
    try {
      const response = await getChatBot(message);
      return { reply: response.data.reply };
    } catch (error) {
      console.log(error);
      return { reply: "Sorry, I'm having trouble connecting right now. Please try again!" };
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

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      const apiResponse = await sendMessageToAPI(inputValue);
      const botMessage = {
        id: messages.length + 2,
        text: apiResponse.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleLoginRedirect = () => {
    setIsOpen(false);
    navigate('/login'); 
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-100 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="booking-btn p-2 text-white bg-gradient-to-r from-red-800 to-red-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <img src="/public/images/logo nataka.png" className="w-8" alt="Logo" />
                </div>
                <div>
                  <h3 className="font-semibold">Nataka Assistant</h3>
                  <p className="text-xs text-red-100">Your drama booking helper</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Please sign in to use Nataka Assistant
              </p>
              <button
                onClick={handleLoginRedirect}
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-full shadow hover:from-red-800 hover:to-red-600 transition-all duration-300"
              >
                <LogIn className="inline-block mr-2" size={18} />
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-red-50 to-white">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-100 text-white w-15 h-12 rounded-full flex items-center justify-center p-2'
                        }`}
                      >
                        {message.sender === 'user' ? (
                          <User size={16} />
                        ) : (
                          <img src="/public/images/logo nataka.png" alt="Bot" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-red-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
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
            {!user && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <LogIn size={12} className="text-white" />
              </div>
            )}
          </div>
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && !user && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </div>
      )}
    </div>
  );
};

export default Chatbot;
