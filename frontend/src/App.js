import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import WebSocketCall from './components/WebSocketCall';
import axios from 'axios'

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [isValidUsername, setValidUsername] = useState(false);
  const [username, setUsername] = useState("");

  const sendUsername = async (e) => {
    e.preventDefault();
    const new_username = e.target[0].value;
    // check if username was used before
    try {
      const response = await axios.get(`https://convo-hub.duckdns.org/api/username/exists/${new_username}`)
        .then( function (response) {
          console.log(response['data']);
            if (response['data'][0]['does_username_exist'] === false) {
              // Insert new username into 'user' table
              insertUsername(new_username);
              setUsername(new_username);
              // send new username to server
              // socketInstance.emit("new_username", username);
              console.log("My username is now - ", new_username);
            } else {
              // Username exists already
              console.log("Username already exists - ", new_username);
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
    await axios.post(`https://convo-hub.duckdns.org/api/username/new`, {"new_user" : new_user})
      .then(function () {
        setValidUsername(true);
      })
      .catch(function (e) {
        console.log(e);
      })
  }

  useEffect(() => {
    const socket = io();  // For testing, using local_ip:PORT, else leave blank
    
    setSocketInstance(socket);
    
    socket.on("connect", (data) => {
      console.log(data);
    });
    
    socket.on("disconnect", (data) => {
      console.log(data);
    });
    
    return function cleanup() {
      socket.disconnect();
    };
  }, []);
  
  return (
    <div className="App">
      {/* Prompt and validate username */}
      <h1>Chat.io</h1>
      {(() => {
        if (!isValidUsername) {
          return (
            <form onSubmit={sendUsername} className="username">
              <input type="text" name="username" className="username" placeholder="Enter a username"/>
              <button type="submit" className="valid">Check username</button>
            </form>
          )
        } else if (isValidUsername && socketInstance && username != "") {
          return (
            <div>
              <WebSocketCall socket={socketInstance} currentUsername={username}/>
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
