#Entry point for server
from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///watchly.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


@app.route('/status', methods=['GET'])
def status():
    """Returns server status"""
    return {"message": "Server is running"}, 200

if __name__== '__main__':
    app.run(debug=True)
