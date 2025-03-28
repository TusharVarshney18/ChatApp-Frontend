import React, { useEffect, useState } from 'react';

const API_URL = 'https://socketproject-backend.onrender.com/'; // Replace with your backend URL

const sendMessageToAI = async (message) => {
   try {
      const response = await fetch(`${API_URL}/api/ai`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data.response;
   } catch (error) {
      console.error('Error communicating with AI:', error);
      return 'Sorry, something went wrong.';
   }
};

const AIChat = ({ socket, username }) => {
   const [currentMessage, setCurrentMessage] = useState('');
   const [messageList, setMessageList] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const sendMessage = async () => {
      if (currentMessage.trim() !== '') {
         const userMessage = {
            author: username,
            message: currentMessage,
            time: new Date().toLocaleTimeString('en-US', {
               hour: '2-digit',
               minute: '2-digit',
               hour12: true,
               timeZone: 'Asia/Kolkata' // Set timezone to IST
            }),
         };

         setMessageList((list) => [...list, userMessage]);
         setCurrentMessage('');
         setIsLoading(true);

         // Emit the AI message to the server
         if (socket) {
            socket.emit('send_ai_message', { message: currentMessage });
         } else {
            console.error('Socket is not defined');
         }
      }
   };

   useEffect(() => {
      if (!socket) {
         console.error('Socket is not defined');
         return;
      }

      // Listen for AI responses from the server
      const handleReceiveAIMessage = (data) => {
         setMessageList((list) => [...list, data]); // Add AI response to chat history
         setIsLoading(false); // Hide loading indicator
      };

      socket.on('receive_ai_message', handleReceiveAIMessage);

      return () => {
         socket.off('receive_ai_message', handleReceiveAIMessage); // Clean up the listener
      };
   }, [socket]);

   return (
      <div className="chat-window flex flex-col h-screen bg-white shadow-lg rounded-lg overflow-hidden">
         <div className="chat-header bg-green-600 text-white py-4 px-6">
            <h3 className="text-lg font-semibold text-center sm:text-left">AI Chat</h3>
         </div>
         <div className="chat-body flex-1 overflow-y-auto p-4 bg-gray-100">
            {messageList.map((messageContent, index) => (
               <div
                  key={index}
                  className={`flex ${username === messageContent.author ? 'justify-end' : 'justify-start'} mb-4`}
               >
                  <div
                     className={`max-w-full sm:max-w-xs px-4 py-2 rounded-lg shadow ${username === messageContent.author ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                        }`}
                  >
                     <p className="text-sm font-semibold">{messageContent.author}</p>
                     <p className="text-sm">{messageContent.message}</p>
                     <span className="text-xs text-gray-300 mt-1 block text-right">{messageContent.time}</span>
                  </div>
               </div>
            ))}
            {isLoading && (
               <div className="flex justify-start mb-4">
                  <div className="max-w-full sm:max-w-xs px-4 py-2 rounded-lg shadow bg-gray-200 text-black">
                     <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
                        <p className="text-sm italic">AI is typing...</p>
                     </div>
                  </div>
               </div>
            )}
         </div>
         <div className="chat-footer bg-white py-4 px-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
               type="text"
               placeholder="Type your message..."
               className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={currentMessage}
               onChange={(e) => setCurrentMessage(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
               onClick={sendMessage}
               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
            >
               Send
            </button>
         </div>
      </div>
   );
};

export default AIChat;
