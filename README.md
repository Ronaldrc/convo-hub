IN-PROGRESS!

# convo-hub
Live chat with anyone in the world using our [website](https://convo-hub.duckdns.org)

# Description
Full stack website allowing users to chat amongst each other.

# How does it work?
Our project leverages ReactJS for the frontend and Flask for the backend. A dockerized instance of PostgreSQL with 24/7 uptime stores all chat messages. Additional features include allowing users to filter messages based on usernames or dates.

Live communication is done using Socket.io, a library providing low-latency and bidirectional communication. The chat-room follows a publish and subscribe model, where all connected users leverage Socket.io to constantly listen for events or messages from other chatters.

# Diagram
In-progress!