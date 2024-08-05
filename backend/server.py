import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

load_dotenv(".env")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URL')
CORS(app)

db = SQLAlchemy(app)

# Define model
class UserMessage(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40))
    message = db.Column(db.String(400), nullable=False)
    time_message_sent = db.Column(db.DateTime(timezone=True), nullable=False)

    def json(self):
        return {
            'id': self.id,
            'username' : self.username,
            'message' : self.message,
            'time_message_sent' : self.time_message_sent
        }

# Create all tables
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
    
@app.route('/api/test', methods=['POST'])
def post_username_message_time():
    try:
        data = request.get_json()
        new_user = UserMessage(
            username = data['username'],
            message = data['message'],
            time_message_sent = ['time_message_sent'],
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'new_user' : new_user,
            'message' : 'success'
        }, 200)
    except Exception as e:
        return(f"Failed to post username, message, and time - {e}", 500)

@app.route('/api/', methods=['GET'])
def get_username_message_time():
    try:
        response = db.Query.filter(UserMessage.username == 'kingjames').all()
        if response:
            return jsonify({
                'get_username_message' : 'successfully received',
                'response' : response
            }, 200)
        if not response:
            return jsonify({
                'get_username_message' : 'no username found'
            }, 200)
    except Exception as e:
        return(f"Failed to get username, message, and time sent - {e}")

app.run(host=os.getenv('HOST_IP'), debug=True)
