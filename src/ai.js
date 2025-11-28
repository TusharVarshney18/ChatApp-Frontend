import React, { useEffect, useState } from "react";

const API_URL = "https://socketproject-backend.onrender.com";

const AIChat = ({ socket, username }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      return;
    }

    const userMessage = {
      author: username || "You",
      message: currentMessage.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    };

    setMessageList((list) => [...list, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    socket.emit("send_ai_message", { message: userMessage.message });
  };

  useEffect(() => {
    if (!socket) {
      console.error("Socket is not defined");
      return;
    }

    const handleReceiveAIMessage = (data) => {
      // Expecting backend to send: { author: "AI", message: "...", time: "..." }
      setMessageList((list) => [...list, data]);
      setIsLoading(false);
    };

    socket.on("receive_ai_message", handleReceiveAIMessage);

    return () => {
      socket.off("receive_ai_message", handleReceiveAIMessage);
    };
  }, [socket]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <div className="relative mx-auto my-4 flex w-full max-w-4xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl shadow-[0_30px_80px_rgba(15,23,42,0.95)] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-950 px-5 py-3 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">AI Operator</p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-50">
              Tushar.Studio <br /> Chat App
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Signed in as <span className="font-medium text-slate-100">{username}</span>
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-5 md:py-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
            {messageList.map((m, i) => {
              const isMe = m.author === (username || "You");
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
                    <p className="text-[13px] leading-relaxed">{m.message}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[78%] md:max-w-sm rounded-2xl bg-slate-800/90 px-3 py-2.5 text-sm text-slate-50 shadow-md rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-300" />
                    <span className="text-[13px] italic">AI is thinking…</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-800/80 bg-slate-900/95 px-3 py-3 md:px-5 md:py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask anything, or describe what you need…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={sendMessage}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-md shadow-emerald-500/40 hover:bg-emerald-600 hover:shadow-emerald-500/60 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
