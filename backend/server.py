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
CORS(app, resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

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
    
# @app.route('/api/username-message-time/isoformat', methods=['POST'])
# def post_username_message_time():
#     try:
#         data = request.get_json()
#         # time_message_send = datetime.fromisoformat()
#         new_user = UserMessage(
#             username = data['username'],
#             message = data['message'],
#             time_message_sent = data['time_message_sent'],
#         )
#         db.session.add(new_user)
#         db.session.commit()
#         return jsonify({
#             'new_user' : new_user,
#             'message' : 'success'
#         }, 200)
#     except Exception as e:
#         return(f"Failed to post username, message, and time - {e}", 500)

@app.route('/api/username/kingjames', methods=['GET'])
def get_username_message_time():
    try:
        response = db.Query.filter(UserMessage.username == 'kingjames').all()
        if response:
            return jsonify({
                'get_username_message' : 'successfully received',
                'response' : response
            }, 200)
        if response is None:
            return jsonify({
                'get_username_message' : 'no username found'
            }, 200)
    except Exception as e:
        return(f"Failed to get username, message, and time sent - {e}")
    
# Check if username was seen before
#   username is retrieved from form
@app.route('/api/username/exists', methods=['POST'])
def does_username_exist():
    username = request.form.get('username')
    try:
        response = db.Query.filter(UserMessage.username == username).first()
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

## Check if the username the person typed exists or not
##      error if username already exists

## Get all usernames, time sent, and messages from database

####################
## Define socket-related routes
####################
@socketio.on('connect')
def connect():
    print(request.sid)
    print("\tclient has connected")
    emit("connected", {"data": f"id: {request.sid} is connected"})

@socketio.on('message')
def handle_message(data):
    print("data from the front end: ", str(data))
    emit("data", {
        'data': data,
        'id': request.sid
    }, broadcast=True)

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
