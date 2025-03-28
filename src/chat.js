import React, { useEffect, useState } from 'react';

const Chat = ({ socket, username, room }) => {
   const [currentMessage, setCurrentMessage] = useState('');
   const [messageList, setMessageList] = useState([]);
   const [isTyping, setIsTyping] = useState(false);
   const [typingUser, setTypingUser] = useState('');
   const [members, setMembers] = useState([]);
   const [showMembers, setShowMembers] = useState(false);

   const sendMessage = async () => {
      if (currentMessage !== '') {
         const messageData = {
            room: room,
            author: username,
            message: currentMessage,
            time: new Date().toLocaleTimeString('en-US', {
               hour: '2-digit',
               minute: '2-digit',
               hour12: true,
               timeZone: 'Asia/Kolkata' // Set timezone to IST
            }),
         };

         await socket.emit('send_message', messageData);
         setCurrentMessage(''); // Clear the input field
         socket.emit('stop_typing', { room });
      }
   };

   const handleTyping = () => {
      if (!isTyping) {
         setIsTyping(true);
         socket.emit('typing', { room, author: username });
      }

      // Stop typing after a delay
      const timeout = setTimeout(() => {
         setIsTyping(false);
         socket.emit('stop_typing', { room });
      }, 2000);

      return () => clearTimeout(timeout);
   };

   const leaveRoom = () => {
      socket.emit('leave_room', room);
      window.location.reload(); // Reload the page to reset the state
   };

   const fetchMembers = () => {
      socket.emit('get_members', room);
   };

   useEffect(() => {
      socket.emit('join_room', { room, username }); // Send username when joining the room

      const handleReceiveMessage = (data) => {
         setMessageList((list) => [...list, data]);
      };

      const handleTyping = (author) => {
         setTypingUser(author);
      };

      const handleStopTyping = () => {
         setTypingUser('');
      };

      const handleMembersList = (membersList) => {
         setMembers(membersList); // Update members list
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);
      socket.on('members_list', handleMembersList);

      return () => {
         socket.off('receive_message', handleReceiveMessage);
         socket.off('typing', handleTyping);
         socket.off('stop_typing', handleStopTyping);
         socket.off('members_list', handleMembersList);
      };
   }, [socket, room, username]);

   return (
      <div className="chat-window flex flex-col h-screen bg-white shadow-lg rounded-lg overflow-hidden">
         <div className="chat-header bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-center sm:text-left">Room: {room}</h2>
            <div className="flex space-x-4">
               <button
                  onClick={() => {
                     fetchMembers();
                     setShowMembers(!showMembers);
                  }}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
               >
                  Info
               </button>
               <button
                  onClick={leaveRoom}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
               >
                  Leave Room
               </button>
            </div>
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
            {typingUser && (
               <div className="text-sm text-gray-500 italic text-center sm:text-left">
                  {typingUser} is typing...
               </div>
            )}
         </div>
         {showMembers && (
            <div className="bg-gray-200 p-4">
               <h3 className="text-lg font-semibold">Members:</h3>
               <ul className="list-disc list-inside">
                  {members.map((member, index) => (
                     <li key={index}>{member}</li>
                  ))}
               </ul>
            </div>
         )}
         <div className="chat-footer bg-white py-4 px-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
               type="text"
               placeholder="Type your message..."
               className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={currentMessage}
               onChange={(e) => {
                  setCurrentMessage(e.target.value);
                  handleTyping();
               }}
               onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
               onClick={sendMessage}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
            >
               Send
            </button>
         </div>
      </div>
   );
};

export default Chat;
