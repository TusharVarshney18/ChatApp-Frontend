import React, { useState } from 'react';
import io from 'socket.io-client';
import Chat from './chat.js';
import AIChat from './ai.js';
import './App.css';

const App = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const socket = React.useMemo(() => io.connect('https://socketproject-backend.onrender.com/'), []);

  const joinRoom = () => {
    if (username !== '' && room !== '') {
      if (socket) {
        socket.emit('join_room', room);
        setShowChat(true);
      } else {
        console.error('Socket is not defined');
      }
    }
  };

  React.useEffect(() => {
    if (socket) {
      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });
    }
  }, [socket]);

  return (
    <div className="App h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
      {!showChat && !showAIChat ? (
        <div className="joinchatcontainer bg-white shadow-2xl rounded-2xl p-10 w-96">
          <h3 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
            Welcome to Chat
          </h3>
          <p className="text-gray-500 text-center mb-8">
            Enter your details to join a chat room and start chatting instantly.
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-5 py-3 mb-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <input
            type="text"
            placeholder="Room ID"
            className="w-full px-5 py-3 mb-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400"
            onChange={(e) => setRoom(e.target.value)}
            value={room}
          />
          <button
            onClick={joinRoom}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition duration-300"
          >
            Join Chat
          </button>
          <button
            onClick={() => setShowAIChat(true)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-300 mt-4"
          >
            Talk to AI
          </button>
        </div>
      ) : showChat ? (
        <Chat socket={socket} username={username} room={room} />
      ) : (
        <AIChat socket={socket} username={username} /> // Pass the socket instance to AIChat
      )}
    </div>
  );
};

export default App;
