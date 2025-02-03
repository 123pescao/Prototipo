from flask import Blueprint, jsonify, request
from app.models import Metric
from app import db
from datetime import datetime
from app.routes.auth import token_required

metrics_bp = Blueprint('metrics', __name__, url_prefix='/metrics')

#route to fetch all metrics for espicifc website
@metrics_bp.route('/', methods=['GET'])
@token_required
def get_metrics(current_user):
    website_id = request.args.get('website_id', type=int)

    #validate required parameter
    if not website_id:
        return jsonify({"error": "Website ID is required"}), 400

    #Fetch metrics for given website
    metrics = Metric.query.filter_by(website_id=website_id).all()

    #serialize metrics data
    metrics_data = [
        {
            "id": metric.id,
            "website_id": metric.website_id,
            "uptime": metric.uptime,
            "timestamp": metric.timestamp.isoformat()
        }
        for metric in metrics
    ]

    return jsonify(metrics_data), 200

#Route to add new metric
@metrics_bp.route('/add', methods=['POST'])
@token_required
def add_metric(current_user):
    data = request.get_json()

    #Extract and validate input
    website_id = data.get('website_id')
    response_time = data.get('response_time')
    uptime = data.get('uptime')

    if not website_id or response_time is None or uptime is None:
        return jsonify({"error": "Missing required fields"}), 400


    #Create new Metric object
    new_metric = Metric(
        website_id=website_id,
        response_time=response_time,
        uptime=uptime,
        timestamp=datetime.now() #Set current time
    )

    #Add metric to database
    db.session.add(new_metric)
    db.session.commit()

    return jsonify({
        "message": "Metric added successfully!",
        "metric": {
            "id": new_metric.id,
            "website_id": new_metric.website_id,
            "response_time": new_metric.response_time,
            "uptime": new_metric.uptime,
            "timestamp": new_metric.timestamp.isoformat()
        }
    }), 201
