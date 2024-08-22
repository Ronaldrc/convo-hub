import { useEffect, useState } from 'react';
import Chat from './Chat';

function WebSocketCall({ socket, currentUsername }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [currentUser, setCurrentUser] = useState("");

    // Set the current username, only once
    useEffect(() => {
        setCurrentUser(currentUsername);
        console.log("My current username is - ", currentUser);
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
            "username" : currentUser
        };
        socket.emit("data", data);
        setMessage("");
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