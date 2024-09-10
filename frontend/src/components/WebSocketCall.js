import { useEffect, useState } from 'react';
import Chat from './Chat';
import axios from 'axios';

function WebSocketCall({ socket, currentUsername, numberOfUsers }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [currentUser, setCurrentUser] = useState("");
    const [userCount, setUserCount] = useState(numberOfUsers);

    // Set the current username, only once
    useEffect(() => {
        setCurrentUser(currentUsername);
    }, []);

    const handleText = (e) => {
        const inputMessage = e.target.value;
        setMessage(inputMessage);
    };
    
    const handleSubmit = () => {
        if (!message) {
            return;
        }
        // Emit json containing message and username
        const data = { "message" : message, 
            "username" : currentUser,
            "time_message_sent" : new Date().toISOString()
        };
        socket.emit("data", data);
        setMessage("");
        const response = axios.post(`https://convo-hub.duckdns.org/api/username-message-time`, {"data" : data}) // Update URL
            .then(function () {
                console.log("\tSuccessfully sent message/time/username!");
            })
            .catch(function (e) {
                console.log(e);
        })
    };

    useEffect(() => {
        socket.on("data", (data) => {
            setMessages([...messages, data.message]);
            setUsernames([...usernames, data.username]);
        });

        // Increment user counter when a new connection is detected
        socket.on("connected", (data) => {
            setUserCount(data['user_count']);
        });

        // Decrement user counter
        socket.on("disconnected", (data) => {
            setUserCount(data['user_count']);
        });
        return () => {
            socket.off("data", () => {
                console.log("data event was removed");
            })
        }
    }, [socket, messages, usernames]);

    // Allow return key press to act as submission
    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            handleSubmit(e);
        }
    }
    
    return (
        <div className="chat-boxes">
            <Chat usernames={usernames} messages={messages}></Chat>
            <textarea
                maxLength="400"
                className="user-text"
                value={message}
                onChange={handleText}
                placeholder="Type in the small textbox..."
                onKeyDown={onEnterPress}
            ></textarea>
            <div className="counter-submit">
                <div className="user-counter">Users: {userCount}</div>
                <button className="submit-chat" onClick={handleSubmit}>submit</button>
            </div>
        </div>
    );
}
export default WebSocketCall;