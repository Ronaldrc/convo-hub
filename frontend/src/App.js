import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import WebSocketCall from './components/WebSocketCall';
import HttpCall from './components/HttpCall'
import React from 'react';
import './App.css';


function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [text, setText] = useState(""); // State to store the textbox content
  const [smallText, setSmallText] = useState(""); // State for the small textbox

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  useEffect(() => {
    if (buttonStatus === true) {
      const socket = io({
        transports: ["websocket"],
        cors: {
          credentials: true
        }
      })
      
      setSocketInstance(socket);
      
      socket.on("connect", (data) => {
        console.log(data);
      });

      setLoading(false);
      
      socket.on("disconnect", (data) => {
        console.log(data);
      });
      
      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [buttonStatus]);
  
  return (
    <div className="App">
      <h1>Chat.io</h1>
      <div className="line">
      <textarea
        className="textbox"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
      ></textarea>

<textarea
        className="smallrectangle"
        value={smallText}
        onChange={(e) => setSmallText(e.target.value)}
        placeholder="Type in the small textbox..."
      ></textarea>
        <HttpCall/>
      </div>
      {!buttonStatus ? (
        <button onClick={handleClick}>turn chat on</button>
      ) : (
        <>
          <button onClick={handleClick}>turn chat off</button>
          <div className="line">
            {!loading && <WebSocketCall socket={socketInstance}/>}
          </div>
        </>
      )}

    </div>
  );
}

export default App;
