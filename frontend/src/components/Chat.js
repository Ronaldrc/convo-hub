import React from "react";

const Chat = ({usernames, messages}) => {
    return (
        <div className="textbox">
            {messages.map((message, index) => (
            <div key={index}>
                <strong>{usernames[index]}:</strong> {message}
                </div>
            ))}
        </div>
    );
};

export default Chat;