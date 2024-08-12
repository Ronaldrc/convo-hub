import { useEffect, useState } from 'react';

function WebSocketCall({ socket }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    
    const handleText = (e) => {
        const inputMessage = e.target.value;
        setMessage(inputMessage);
    };
    
    const handleSubmit = () => {
        if (!message) {
            return;
        }
        socket.emit("message", message);
        setMessage("");
    };
    
    useEffect(() => {
        socket.on("data", (data) => {
            setMessages([...messages, data.data]);
        });
        return () => {
            socket.off("message", () => {
                console.log("data event was removed");
            })
        }
    }, [socket, messages]);
    
    return (
        <div>
        <h2>WebSocket Communication</h2>
        <input type="text" value={message} onChange={handleText}/>
        <button onClick={handleSubmit}>submit</button>
        <ul>
            {messages.map((message, index) => {
                return <li key={index}>{message}</li>
            })}
        </ul>
    </div>
    );
}
export default WebSocketCall;