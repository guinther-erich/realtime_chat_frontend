import './App.css';
import { io } from "socket.io-client";
import logo from "./assets/logo.png";
import { useEffect, useRef, useState } from "react";

import CreateUser from "./components/CreateUser";
import OnlineUsers from "./components/OnlineUsers";
import MessagesControl from "./components/MessagesControl";


const socket = io(`http://localhost:7000`);

function App() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [receiver, setReceiver] = useState("");
  const [avatar, setAvatar] = useState("");
  const [media, setMedia] = useState(null);
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState("");
  const [groupMessage, setGroupMessage] = useState({});
  const receiverRef = useRef(null);

  const sortNames = (username1, username2) => {
    return [username1, username2].sort().join("-");
  };

  const gotoBottom = () => {
    const el = document.querySelector(".message-area ul");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const onCreateUser = () => {
    console.log(username);

    socket.emit("guest.new", username);
    const a = parseInt(Math.floor(Math.random() * 8) + 1) + ".png";
    setAvatar(a);

    setStep((prevStep) => prevStep + 1);
  };

  const onUserSelect = (username) => {
    setReceiver(username);
    receiverRef.current = username;
    setStep((prevStep) => prevStep + 1);
  };

  const onChatClose = () => {
    setStep(1);
    receiverRef.current = null;
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const data = {
      sender: username,
      receiver,
      message,
      media,
      avatar,
      view: false,
    };

    socket.emit("message.new", data);

    const key = sortNames(username, receiver);
    const tempGroupMessage = { ...groupMessage };
    if (key in tempGroupMessage) {
      tempGroupMessage[key] = [
        ...tempGroupMessage[key],
        { ...data, view: true },
      ];
    } else {
      tempGroupMessage[key] = [{ ...data, view: true }];
    }

    setGroupMessage({ ...tempGroupMessage });

    if (media !== null) {
      setMedia(null);
    }

    setMessage("");

  };

  const checkUnseenMessages = (receiver) => {
    const key = sortNames(username, receiver);
    let unseenMessages = [];
    if (key in groupMessage) {
      unseenMessages = groupMessage[key].filter((msg) => !msg.view);
    }

    return unseenMessages.length;
  };

  useEffect(() => {
    socket.on("guests.all", (users) => {
      console.log({ users });
      setUsers(users);
    });

    socket.on("message.new", (data) => {
      console.log(data);

      console.log({ rec: receiverRef.current, data }, "asfedfee");

      setGroupMessage((prevGroupMessage) => {
        const messages = { ...prevGroupMessage };
        const key = sortNames(data.sender, data.receiver);

        if (receiverRef.current === data.sender) {
          data.view = true;
        }

        if (key in messages) {
          messages[key] = [...messages[key], data];
        } else {
          messages[key] = [data];
        }

        return { ...messages };
      });
    });
  }, []);

  useEffect(() => {
    updateMessageView();
  }, [receiver]);

  const updateMessageView = () => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      const messages = groupMessage[key].map((msg) =>
        !msg.view ? { ...msg, view: true } : msg
      );

      groupMessage[key] = [...messages];

      setGroupMessage({ ...groupMessage });
    }
  };

  useEffect(() => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      if (groupMessage[key].length > 0) {
        gotoBottom();
      }
    }
  }, [groupMessage]);

  console.log(groupMessage);

  return (
    <div className="App">
      <header className="app-header">
        <img src={logo} alt=""/>
        <div className="app-name b-500 primaryColor">
          Real Time Chat
        </div>
      </header>

      <div className="chat-system">
        <div className="chat-box">
          { step === 0 ? (
            <CreateUser 
              onCreateUser={onCreateUser} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : null }
          { step === 1 ? (
            <OnlineUsers 
              onUserSelect={onUserSelect}
              users={users}
              username={username}
              checkUnseenMessages={checkUnseenMessages}
            />
          ) : null }
          { step === 2 ? (
            <MessagesControl
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sendMessage={sendMessage} 
              groupMessag={groupMessage}
              sortNames={sortNames}
              username={username}
              receiver={receiver}
              setMedia={setMedia}
              onChatClose={onChatClose}
              media={media}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;              
