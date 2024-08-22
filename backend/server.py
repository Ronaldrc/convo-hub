import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from datetime import datetime

load_dotenv(".env")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URL')
CORS(app, resources={r"/*":{"origins": os.getenv('PUBLIC_URL')}})
socketio = SocketIO(app, cors_allowed_origins=os.getenv('PUBLIC_URL'))

db = SQLAlchemy(app)

####################
## Define tables
####################

class Username(db.Model):
    __tablename__ = 'username'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), unique=True, nullable=False)

    def json(self):
        return {
            'id': self.id,
            'username' : self.username
        }

class UserMessage(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False)
    message = db.Column(db.String(400), nullable=False)
    time_message_sent = db.Column(db.DateTime(timezone=True), nullable=False)

    def json(self):
        return {
            'id': self.id,
            'username' : self.username,
            'message' : self.message,
            'time_message_sent' : self.time_message_sent
        }

####################
## Create tables
####################

with app.app_context():
    db.create_all()
    
####################
## Define api routes
####################

@app.route("/api/test", methods=['GET'])
def test():
    try:
        return("SUCCESS testing api route!", 200)
    except Exception as e:
        return(f"FAILED test api route - {e}", 500)

# Insert new username into 'user' table
@app.route('/api/username/new', methods=['POST'])
def post_username():
    try:
        data = request.get_json()
        new_user = Username(
            username = data['new_user']
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'new_user' : data['new_user'],
        }, 200)
    except Exception as e:
        return(f"Failed to post username - {e}", 500)
    
@app.route('/api/username-message-time', methods=['POST'])
def post_username_message_time():
    try:
        data = request.get_json()
        new_user = UserMessage(
            username = data['username'],
            message = data['message'],
            time_message_sent = data['time_message_sent']
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'new_user' : new_user.json(),
            'message' : 'success'
        }, 200)
    except Exception as e:
        return(f"Failed to post username, message, and time - {e}", 500)

# Retrieve last 10 usernames, messages, and time sent
@app.route('/api/get/ten-messages', methods=['GET'])
def get_ten_messages():
    try:
        response = db.Query.order_by(UserMessage.time_message_sent.desc()).limit(10)
        if response is not None:
            return jsonify({
                'get_ten_messages' : 'success',
                'data' : response.json()
            })
    except Exception as e:
        return jsonify({
            'get_ten_messages' : 'failed',
            'error' : e
        })
    
# Check if username was seen before
#   username is retrieved from form
@app.route('/api/username/exists/<username>', methods=['GET'])
def does_username_exist(username):
    try:
        response = Username.query.filter(Username.username == username).first()
        if response:
            return jsonify({
                'does_username_exist' : True
            }, 200)
        if response is None:
            return jsonify({
                'does_username_exist' : False
            }, 200)
    except Exception as e:
        return(f"Failed to check if username exists - {e}")
    
####################
## Define socket-related routes
####################

@socketio.on('connect')
def connect():
    print(f"\t {request.sid} client has connected")
    emit("connected", {"data": f"id: {request.sid} is connected"})

# data contains message and username
@socketio.on('data')
def handle_message(data):
    print(f"Username '{data['username']}' said '{data['message']}'")
    emit("data", {
        'message': data['message'],
        'username': data['username']
    }, broadcast=True)

@socketio.on('new_username')
def new_username(username):
    print(f"\tnew username - {username}")
    emit("new_username", 
         {f"new username made" : {username}}, broadcast=True)

@socketio.on('disconnect')
def disconnected():
    print("\tuser disconnected")
    emit("disconnect", f"user{request.sid} disconnected", broadcast=True)

@socketio.on_error_default
def default_error_handler(e):
    print(request.event["message"]) # "my error event"
    print(request.event["args"])    # (data,)

# app.run(host=os.getenv('HOST_IP'), debug=True)
if __name__ == '__main__':
    socketio.run(app, host=os.getenv('HOST_IP'), debug=True)
