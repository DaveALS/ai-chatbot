import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Bot, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const AIChatbot = () => {
  // Custom styles for Aimee's avatar
  const avatarStyle = {
    width: '120px',
    height: '120px',
    position: 'absolute',
    top: '-60px',
    right: '-20px',
    borderRadius: '60px',
    backgroundColor: '#f0f4f8',
    backgroundImage: 'url("https://aielevation.co.uk/wp-content/uploads/2025/02/Aimee.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '4px solid white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [showInitialForm, setShowInitialForm] = useState(true);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const optionSets = {
    initial: [
      { id: 1, text: 'AI for workplace assistance' },
      { id: 2, text: 'Sales and marketing enhancement' },
      { id: 3, text: 'Customer communications' },
      { id: 4, text: 'Task automation' },
      { id: 5, text: 'AI knowledge base implementation' },
      { id: 6, text: 'Something else' }
    ],
    somethingElse: [
      { id: 7, text: 'Data analysis' },
      { id: 8, text: 'Predictive analytics' },
      { id: 9, text: 'Supply chain optimization' },
      { id: 10, text: 'Fraud detection' },
      { id: 11, text: 'Custom solution' }
    ],
    contact: [
      { id: 12, text: 'Schedule a meeting' },
      { id: 13, text: 'Request a call back' },
      { id: 14, text: 'Email consultation' }
    ]
  };
  
  const [currentOptionSet, setCurrentOptionSet] = useState('initial');

  const handleInitialSubmit = (name) => {
    setUserName(name);
    setShowInitialForm(false);
    setMessages([{
      type: 'bot',
      content: `Hi ${name}! Thank you for getting in touch. I'm here to help you discover how AI can support your business.

Please select an option below to explore AI solutions tailored to your needs:`,
      options: initialOptions
    }]);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'I look forward to helping you find the right solution.',
      options: []
    }]);
  };

  const handleOptionClick = async (option) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: option.text
    }]);
    setIsTyping(true);
    
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: option.text,
          userName: userName,
          sessionId: Date.now().toString()
        })
      });
      
      const data = await response.json();
      setIsTyping(false);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: data.reply,
        options: data.options || []
      }]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again.');
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText;
    setInputText('');
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);
    setIsTyping(true);
    
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userName: userName,
          sessionId: Date.now().toString()
        })
      });
      
      const data = await response.json();
      setIsTyping(false);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: data.reply,
        options: data.options || []
      }]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again.');
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full p-4 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col relative mt-16">
          <div style={avatarStyle}></div>
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Removed Bot icon since we have Aimee's avatar */}
              <span className="font-semibold">AI Solutions Assistant</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 text-white"
            >
              ×
            </Button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showInitialForm ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Welcome to AI Elevation</h3>
                <p className="text-gray-600">I'm Aimee, and I'm here to help you discover the perfect AI solution for your business. To get started, please introduce yourself:</p>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full p-2 border rounded"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInitialSubmit(userName)}
                />
                <Button 
                  onClick={() => handleInitialSubmit(userName)}
                  className="w-full"
                  disabled={!userName.trim()}
                >
                  Start Chat
                </Button>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.options.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            className="w-full text-left justify-between"
                            onClick={() => handleOptionClick(option)}
                          >
                            {option.text}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="text-gray-500 italic">Aimee is typing...</div>
                )}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Options Area */}
          {!showInitialForm && (
            <div className="p-4 border-t">
              <div className="grid grid-cols-1 gap-2">
                {optionSets[currentOptionSet].map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full text-left justify-between p-4 hover:bg-blue-50"
                    onClick={() => {
                      handleOptionClick(option);
                      if (option.id === 6) {
                        setCurrentOptionSet('somethingElse');
                      } else if (currentOptionSet === 'somethingElse' || option.id <= 5) {
                        setCurrentOptionSet('contact');
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">
                        {option.id}
                      </span>
                      {option.text}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </Button>
                ))}
                {currentOptionSet !== 'initial' && (
                  <Button
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setCurrentOptionSet('initial')}
                  >
                    ← Back to main options
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatbot;