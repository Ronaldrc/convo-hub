import { useEffect, useState } from 'react';
import Chat from './Chat';
import axios from 'axios';

function WebSocketCall({ socket, currentUsername }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [currentUser, setCurrentUser] = useState("");

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
        console.log(data.time_sent);
        socket.emit("data", data);
        setMessage("");
        const response = axios.post(`http://192.168.1.121:5000/api/username-message-time`, {"data" : data})
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
        return () => {
            socket.off("data", () => {
                console.log("data event was removed");
            })
        }
    }, [socket, messages, usernames]);

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
                maxlength="400"
                className="smallrectangle"
                value={message}
                onChange={handleText}
                placeholder="Type in the small textbox..."
                onKeyDown={onEnterPress}
            ></textarea>
            <button onClick={handleSubmit}>submit</button>
        </div>
    );
}
export default WebSocketCall;