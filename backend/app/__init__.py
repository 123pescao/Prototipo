from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

#Initialize database
db = SQLAlchemy()

#App factory function
def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///watchly.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)  #Bind SQLA to Flask app

    from app.routes.alerts import alerts_bp #Import after db is initialized
    from app.routes.websites import websites_bp
    from app.routes.metrics import metrics_bp
    from app.routes.auth import auth_bp
    app.register_blueprint(alerts_bp)  #Register alerts bp
    app.register_blueprint(websites_bp) #Register websites bp
    app.register_blueprint(metrics_bp) #Register metrics bp
    app.register_blueprint(auth_bp) #Register auth bp

    #Moved route here so its available for tests
    @app.route('/status', methods=['GET'])
    def status():
        return jsonify({"message": "Server is running"}), 200

    return app