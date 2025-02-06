import React from 'react';
import ChatInterface from './components/ChatInterface';

const App = () => {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <ChatInterface />
      </div>
    </main>
  );
};

export default App;