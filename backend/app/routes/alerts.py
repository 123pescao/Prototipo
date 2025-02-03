#Alerts blueprint
from flask import current_app, Blueprint, jsonify, request
from app.routes.auth import token_required



alerts_bp = Blueprint('alerts', __name__, url_prefix='/alerts')


@alerts_bp.route('/', methods=['GET'])
@token_required
def get_alerts():
    from app.models import Alert #Delayed import to avoid circular import
    #filter by website_id
    website_id = request.args.get('website_id', type=int)

    if website_id:
        alerts = Alert.query.filter_by(website_id=website_id).all()
    else:
        alerts = Alert.query.all()

    #Serialize alerts to JSON
    alerts_data = [
        {
            "id": alert.id,
            "website_id": alert.website_id,
            "alert_type": alert.alert_type,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat(),
        }
        for alert in alerts
    ]
    return jsonify(alerts_data), 200

@alerts_bp.route('/<int:alert_id>', methods=['PATCH'])
@token_required
def update_alert(alert_id):
    from app.models import Alert #Delayed to avoid circular import
    #Find the alert by ID
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    #Get the new status from the request JSON
    data = request.get_json()
    new_status = data.get('status')
    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    #Update alert status
    alert.status = new_status
    from app import db #Delayed import to avoid circular import
    db.session.commit()

    return jsonify({
        "message": "Alert updated successfully",
        "alert": {
            "id": alert.id,
            "website_id": alert.website_id,
            "alert_type": alert.alert_type,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat(),
        }
    }), 200