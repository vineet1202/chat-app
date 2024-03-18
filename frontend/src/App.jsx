import "./App.css";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io.connect("http://localhost:3000");

function App() {
  const [formData, setFormData] = useState("");
  const [room, setRoom] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const username = formData;
  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("joinRoom", { username, room });
    setIsSubmitted(true);
  };

  const [message, setMessage] = useState(" ");
  const [chat, setChat] = useState([]);
  const time = new Date().toLocaleTimeString();

  const [rooms, setRooms] = useState("");
  const [roomUsers, setRoomUsers] = useState([]);

  const sendChat = (e) => {
    e.preventDefault();
    socket.emit("chat", { message, username, time, room });
    setMessage("");
  };

  useEffect(() => {
    // console.log("Socket connected:", socket.connected);
    socket.on("chat", (payload) => {
      setChat([...chat, payload]);
    });

    socket.on("roomUsers", ({ room, users }) => {
      // console.log("Received roomUsers:", { room, users });
      setRooms(room);
      setRoomUsers(users);
    });
  }, [chat]);

  const [showUsers, setShowUsers] = useState(false);

  const handleOutsideClick = () => {
    if (showUsers) setShowUsers(false);
  };

  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView();
  }, [chat]);
  return (
    <div onClick={handleOutsideClick}>
      {!isSubmitted && (
        <div className="form-container">
          <h1 className="text-center text-3xl mb-4">Login</h1>
          <form onSubmit={handleSubmit} className=" flex flex-col mx-auto ">
            <label htmlFor="username" />
            <input
              type="text"
              name="username"
              className="input"
              value={formData}
              placeholder="username"
              onChange={(e) => setFormData(e.target.value)}
              required
            />
            <label htmlFor="room" />
            <input
              type="text"
              name="room"
              className="input"
              value={room}
              placeholder="room - maths/physics"
              onChange={(e) => setRoom(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn bg-blue-600 text-white hover:bg-blue-500"
            >
              Enter Chatroom
            </button>
          </form>
        </div>
      )}
      {isSubmitted && (
        <div className="chatBox">
          <div className="dashboard">
            <p className="text-2xl font-italic font-semibold">Room: {rooms}</p>
            <div className="dropdown">
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="text-lg font-bold"
              >
                Users
              </button>
              <div
                className={` ${
                  showUsers ? "block" : "hidden"
                } dropdown-content `}
              >
                {roomUsers.map((user, i) => (
                  <p key={i} className="text-lg">
                    {user.username}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="h-3/4  px-2 right-0 border overflow-y-scroll">
            {chat.map((payload, index) => (
              <div key={index} ref={listRef}>
                {payload.username === username ? (
                  <div className="flex justify-end">
                    <span className="text-xs text-slate-400 mt-7 ">
                      {payload.time}
                    </span>
                    <p key={index} className="msg-self">
                      {payload.message}
                    </p>
                  </div>
                ) : (
                  <div className="flex">
                    <span className="text-blue-700 bg-[#E9ECEF] py-1 px-3 rounded-full my-auto">
                      {payload.username[0]}
                    </span>

                    <p key={index} className="msg-user">
                      {payload.message}
                    </p>
                    <span className="text-xs text-slate-400 mt-7 ">
                      {payload.time}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={sendChat}
            className="text-center absolute bottom-0 border flex w-full justify-between"
          >
            <input
              type="text"
              name="chat"
              placeholder="Send text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              className="border rounded-md text-xl p-6 w-full outline-none"
            />
            <button
              type="submit"
              className=" border rounded bg-blue-700 text-white px-8 hover:bg-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
