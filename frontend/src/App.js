import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import WebSocketCall from './components/WebSocketCall';
import axios from 'axios'

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [isValidUsername, setValidUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [userCount, setUserCount] = useState(0);

  const sendUsername = async (e) => {
    e.preventDefault();
    const new_username = e.target[0].value;
    // check if username was used before
    try {
      const response = await axios.get(`https://convo-hub.duckdns.org/api/username/exists/${new_username}`)   // Update URL
        .then( function (response) {
          if (response['data'][0]['does_username_exist'] === false) {
            // Insert new username into 'user' table
            insertUsername(new_username);
            setUsername(new_username);
          } else {
            // Username exists already
            setValidUsername(false);
          }
        })
        .catch(function (e) {
          console.log(e);
        });
      } catch (e) {
        console.log(e);
      }
  }

  const insertUsername = async (new_user) => {
    // Insert new username into 'user' table
    await axios.post(`https://convo-hub.duckdns.org/api/username/new`, {"new_user" : new_user}) // Update URL
      .then(function () {
        setValidUsername(true);
      })
      .catch(function (e) {
        console.log(e);
      })
  }

  useEffect(() => {
    const socket = io() ;  // For testing, using local_ip:PORT, else leave blank

    setSocketInstance(socket);

    socket.on("connected", (data) => {
      setUserCount(data['user_count']);
    });

    socket.off("disconnected", (data) => {
      setUserCount(data['user_count']);
    });
    
    return function cleanup() {
      socket.disconnect();
    };
  }, []);
  
  return (
    <div className="App">
      <h1 className="title">Chat.io</h1>
        {/* Prompt and validate username */}
        {(() => {
          if (!isValidUsername) {
            return (
              <div className="login-box">
                <h2>Welcome</h2>
                <form onSubmit={sendUsername} className="username">
                  <input type="text" name="username" className="username" placeholder="Enter a username"/>
                  <button type="submit" className="valid">Check username</button>
                </form>
              </div>
            )
          } else if (isValidUsername && socketInstance && username !== "") {
            return (
              <div>
                <WebSocketCall socket={socketInstance} currentUsername={username} numberOfUsers={userCount}/>
              </div>
            )
          } else {
            return (
              <h2>Loading.... please wait a moment</h2>
            )
          }
        })()}
    </div>
  );
}

export default App;
