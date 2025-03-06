from flask import request
from flask_restx import Namespace, Resource, fields
from app.models import Metric
from app import db
from datetime import datetime
from app.routes.auth import token_required

metrics_ns = Namespace('metrics', description="Website Metrics Endpoints")

# Models
metric_model = metrics_ns.model("Metric", {
    "id": fields.Integer,
    "website_id": fields.Integer,
    "uptime": fields.Float,
    "response_time": fields.Float,
    "timestamp": fields.DateTime
})

create_metric_model = metrics_ns.model("CreateMetric", {
    "website_id": fields.Integer(required=True, description="Website ID"),
    "response_time": fields.Float(required=True, description="Response time in ms"),
    "uptime": fields.Float(required=True, description="Uptime status (1=Up, 0=Down)")
})

# Route to fetch all metrics for a specific website
@metrics_ns.route('', '/')
@metrics_ns.route('', '/')
class GetMetrics(Resource):
    @metrics_ns.response(200, "Metrics retrieved successfully!", [metric_model])
    @metrics_ns.response(400, "Website ID is required")
    @token_required
    def get(self, current_user):
        """Fetch all metrics for a specific website"""
        website_id = request.args.get('website_id', type=int)
        limit = request.args.get('limit', type=int, default=10)  # Fetch last 10 records

        if not website_id:
            return {"error": "Website ID is required"}, 400

        query = Metric.query.filter_by(website_id=website_id).order_by(Metric.timestamp.desc())

        if limit > 0:
            query = query.limit(limit)  # Fix: limit must be applied to the query object

        metrics = query.all()

        if not metrics:
            return [{
                "id": None,
                "website_id": website_id,
                "uptime": 0.0,  # Ensure numeric uptime (float)
                "response_time": 0.0,  # Ensure numeric response time
                "timestamp": None  # No timestamp available
            }], 200

        return [{
            "id": metric.id,
            "website_id": metric.website_id,
            "uptime": float(metric.uptime),  # Ensure numeric uptime
            "response_time": float(metric.response_time),  #  Ensure numeric response time
            "timestamp": metric.timestamp.isoformat()
        } for metric in metrics], 200

# Route to add a new metric
@metrics_ns.route('/add')
class AddMetric(Resource):
    @metrics_ns.expect(create_metric_model)
    @metrics_ns.response(201, "Metric added successfully!", metric_model)
    @metrics_ns.response(400, "Missing required fields")
    @token_required
    def post(self, current_user):
        """Add a new metric for a website"""
        data = request.get_json()
        website_id = data.get('website_id')
        response_time = data.get('response_time')
        uptime = data.get('uptime')

        if not website_id or response_time is None or uptime is None:
            return {"error": "Missing required fields"}, 400

        new_metric = Metric(
            website_id=website_id,
            response_time=response_time,
            uptime=uptime,
            timestamp=datetime.utcnow()
        )

        db.session.add(new_metric)
        db.session.commit()

        return {
            "message": "Metric added successfully!",
            "metric": {
                "id": new_metric.id,
                "website_id": new_metric.website_id,
                "response_time": new_metric.response_time,
                "uptime": new_metric.uptime,
                "timestamp": new_metric.timestamp.isoformat()
            }
        }, 201
