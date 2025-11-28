import React, { useEffect, useState } from "react";

const TENOR_API_KEY = "YOUR_TENOR_API_KEY"; // Replace with your Tenor API key
const TENOR_API_URL = "https://tenor.googleapis.com/v2/search"; // Tenor API search endpoint

const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifResults, setGifResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      room,
      author: username,
      message: currentMessage.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    };

    socket.emit("send_message", messageData);
    setCurrentMessage("");
    socket.emit("stop_typing", { room });
  };

  const sendGif = (gifUrl) => {
    const gifMessage = {
      room,
      author: username,
      message: gifUrl,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
      isGif: true,
    };

    socket.emit("send_message", gifMessage);
    setShowGifPicker(false);
  };

  const fetchGifs = async (query) => {
    try {
      const response = await fetch(`${TENOR_API_URL}?key=${TENOR_API_KEY}&q=${encodeURIComponent(query || "trending")}&limit=10`);
      const data = await response.json();
      setGifResults(data.results || []);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { room, author: username });
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing", { room });
    }, 2000);

    return () => clearTimeout(timeout);
  };

  const leaveRoom = () => {
    socket.emit("leave_room", room);
    window.location.reload();
  };

  const fetchMembers = () => {
    socket.emit("get_members", room);
  };

  useEffect(() => {
    socket.emit("join_room", { room, username });

    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    const handleTypingEvent = ({ author }) => {
      if (author !== username) setTypingUser(author);
    };

    const handleStopTyping = () => {
      setTypingUser("");
    };

    const handleMembersList = (membersList) => {
      setMembers(membersList);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTypingEvent);
    socket.on("stop_typing", handleStopTyping);
    socket.on("members_list", handleMembersList);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTypingEvent);
      socket.off("stop_typing", handleStopTyping);
      socket.off("members_list", handleMembersList);
    };
  }, [socket, room, username]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <div className="relative mx-auto my-4 flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl shadow-[0_30px_80px_rgba(15,23,42,0.95)] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 px-5 py-3 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Room</p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-50">{room}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Signed in as <span className="font-medium text-slate-100">{username}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchMembers();
                setShowMembers((v) => !v);
              }}
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800/80 transition"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {members.length || 0} online
            </button>

            <button
              onClick={leaveRoom}
              className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 transition"
            >
              Leave
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* MESSAGES */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-5 md:py-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
              {messageList.map((m, i) => {
                const isMe = m.author === username;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-sm shadow-md md:max-w-sm ${
                        isMe ? "bg-indigo-500 text-white rounded-br-sm" : "bg-slate-800/90 text-slate-50 rounded-bl-sm"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-200/80">{m.author}</span>
                        <span className="text-[10px] text-slate-300/70">{m.time}</span>
                      </div>

                      {m.isGif ? (
                        <img src={m.message} alt="GIF" className="mt-1 w-full max-h-56 rounded-xl object-cover" />
                      ) : (
                        <p className="text-[13px] leading-relaxed">{m.message}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {typingUser && <p className="mt-1 text-xs italic text-slate-400">{typingUser} is typing…</p>}
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-800/80 bg-slate-900/95 px-3 py-3 md:px-5 md:py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type a message, /gifs, or /cmd…"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60"
                    value={currentMessage}
                    onChange={(e) => {
                      setCurrentMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(true);
                      fetchGifs("");
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800 transition"
                  >
                    GIF
                  </button>
                  <button
                    type="button"
                    onClick={sendMessage}
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-md shadow-indigo-500/40 hover:bg-indigo-600 hover:shadow-indigo-500/60 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MEMBERS PANEL (desktop) */}
          {showMembers && (
            <aside className="hidden w-56 shrink-0 border-l border-slate-800/80 bg-slate-950/95 px-4 py-4 md:block">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Participants</h3>
              <ul className="space-y-2 text-sm">
                {members.map((m, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                    <span className="truncate">{m}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {/* GIF MODAL */}
        {showGifPicker && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-4 md:p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search GIFs…"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchGifs(searchQuery);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchGifs(searchQuery)}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition"
                >
                  Search
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {gifResults.map((gif) => (
                  <img
                    key={gif.id}
                    src={gif.media_formats.gif.url}
                    alt="GIF"
                    className="cursor-pointer rounded-lg"
                    onClick={() => sendGif(gif.media_formats.gif.url)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowGifPicker(false)}
                className="mt-4 w-full rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
