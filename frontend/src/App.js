import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import WebSocketCall from './components/WebSocketCall';
import axios from 'axios'

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [isValidUsername, setValidUsername] = useState(false);

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  const handleSubmit = () => {
    // send api request
    // check if username was used before
    // axios.post('/api/')
    // if () {

    // }
  }

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
      {/* Prompt and validate username */}
      <div className="title">Chat.io</div>
      <div className="line"></div>
      <form onSubmit={handleSubmit} className="username">
        <input type="text" name="username" className="username" placeholder="username"/>
        <button type="submit" className="valid">Check username</button>
      </form>
       {/* Chat box */}
      {!buttonStatus ? (
        <button type="submit" className="valid">Check username</button>
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
