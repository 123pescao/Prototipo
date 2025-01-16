#Entry point for server
from flask import Flask

app = Flask(__name__)


@app.route('/status', methods=['GET'])
def status():
    """Returns server status"""
    return {"message": "Server is running"}, 200

if __name__== '__main__':
    app.run(debug=True)