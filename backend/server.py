import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

load_dotenv(".env")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URL')
CORS(app)

db = SQLAlchemy(app)

with app.app_context():
    db.reflect()

# Define model
class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Integer)
    message = db.Column(db.String(400), nullable=False)
    time_message_sent = db.Column(db.DateTime, nullable=False)

    def json(self):
        return {
            'id': self.id,
            'username' : self.username,
            'message' : self.message,
            'time_message_sent' : self.time_message_sent
        }

# Define api routes
@app.route("/", methods=['GET'])
def test():
    try:
        return("testing api route! - success!", 200)
    except Exception as e:
        return(f"FAILED test api route - {e}", 500)

app.run(host=os.getenv('HOST_IP'))