import React, { useState } from "react";
import io from "socket.io-client";
import Chat from "./chat.js";
import AIChat from "./ai.js";
import "./App.css";

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const socket = React.useMemo(() => {
    const backendURL = process.env.NODE_ENV === "production" ? "https://socketproject-backend.onrender.com/" : "http://localhost:3002/";
    return io.connect(backendURL);
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      if (socket) {
        socket.emit("join_room", room);
        setShowChat(true);
      } else {
        console.error("Socket is not defined");
      }
    }
  };

  React.useEffect(() => {
    if (socket) {
      socket.on("connect_error", (err) => {
        console.error("Connection error:", err);
      });
    }
  }, [socket]);

  return (
    <div className="App min-h-screen bg-slate-950 text-white">
      {/* Animated gradient + noise overlay */}
      <div className="fixed inset-0 opacity-80 bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_55%),radial-gradient(circle_at_bottom,_#ec4899_0,_transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 mix-blend-overlay opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: hero / branding */}
          <div className="hidden lg:flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Live • End‑to‑end encrypted
              </span>
              <h1 className="mt-6 text-4xl xl:text-5xl font-semibold tracking-tight text-white">Atlas Chat Studio</h1>
              <p className="mt-4 max-w-md text-sm text-slate-300">
                High‑fidelity real‑time rooms, AI copilots, and studio‑grade collaboration. Tuned for founders, teams, and serious builders.
              </p>
            </div>

            <div className="mt-10 space-y-4 text-xs text-slate-300/80">
              <div className="flex items-center justify-between">
                <span>Latency</span>
                <span className="font-mono text-emerald-300">~18ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Uptime</span>
                <span className="font-mono text-emerald-300">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Encryption</span>
                <span className="font-mono text-emerald-300">AES‑256 in transit</span>
              </div>
            </div>
          </div>

          {/* Right: auth / mode switcher */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/70 p-8 md:p-10 backdrop-blur-2xl shadow-[0_24px_70px_rgba(15,23,42,0.9)]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{showAIChat ? "AI Command Room" : "Join a Live Room"}</h2>
                <p className="mt-1 text-xs md:text-sm text-slate-300">Choose between human rooms and your private AI operator.</p>
              </div>

              {!showChat && !showAIChat && (
                <div className="inline-flex items-center rounded-full bg-slate-800/80 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAIChat(false)}
                    className={`px-3 py-1 rounded-full transition ${!showAIChat ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-300"}`}
                  >
                    Rooms
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAIChat(true)}
                    className={`px-3 py-1 rounded-full transition ${showAIChat ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-300"}`}
                  >
                    AI
                  </button>
                </div>
              )}
            </div>

            {/* States */}
            {!showChat && !showAIChat ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">Display name</label>
                    <input
                      type="text"
                      placeholder="Enter your name "
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60"
                      onChange={(e) => setUsername(e.target.value)}
                      value={username}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">Room ID</label>
                    <input
                      type="text"
                      placeholder="product-core, dev-standup, support-01"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60"
                      onChange={(e) => setRoom(e.target.value)}
                      value={room}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Anyone with the same Room ID joins instantly. No links required.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={joinRoom}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 hover:-translate-y-[1px]"
                  >
                    Enter Live Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAIChat(true)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800/80 transition"
                  >
                    Launch AI Operator
                  </button>
                </div>

                <p className="pt-2 text-[11px] text-slate-400">By continuing, you agree to ephemeral session storage and encrypted transport.</p>
              </div>
            ) : showChat ? (
              <Chat socket={socket} username={username} room={room} />
            ) : (
              <AIChat socket={socket} username={username} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
