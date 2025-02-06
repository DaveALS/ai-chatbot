import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ChatInterface = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const options = [
    { id: 1, text: "Intelligent Automation Solutions" },
    { id: 2, text: "Process Optimization" },
    { id: 3, text: "Business Integration" },
    { id: 4, text: "Custom Development" },
    { id: 5, text: "Consultation Services" },
    { id: 6, text: "Other Inquiries" }
  ];

  const handleOptionClick = (id) => {
    console.log(`Selected option: ${id}`);
    setIsExpanded(true);
  };

  return (
    <Card className="w-full max-w-md fixed bottom-4 right-4 shadow-xl bg-white rounded-xl overflow-hidden">
      <CardHeader className="p-4 bg-[#007bff] text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://aielevation.co.uk/wp-content/uploads/2025/02/Aimee-avatar.png" 
            alt="Assistant" 
            className="w-12 h-12 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-lg font-semibold">AI Solutions Assistant</h2>
            <p className="text-sm opacity-90">Always here to help</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex gap-3">
            <img 
              src="https://aielevation.co.uk/wp-content/uploads/2025/02/Aimee.png" 
              alt="AI Assistant"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <p className="text-gray-800 mb-3">
                Welcome! I'm here to help you explore our intelligent automation solutions. 
                How can I assist you today?
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2 px-4 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => handleOptionClick(option.id)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t bg-gray-50">
        <div className="flex w-full gap-2">
          <Input 
            placeholder="Type your message..." 
            className="flex-1 bg-white"
          />
          <Button className="bg-[#007bff] hover:bg-blue-600">
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;