#Alerts blueprint
from flask import current_app, Blueprint, jsonify, request
from app.routes.auth import token_required




alerts_bp = Blueprint('alerts', __name__, url_prefix='/alerts')


#Add alerts
@alerts_bp.route('/add', methods=['POST'])
@token_required
def add_alert(current_user):
    from app.models import Alert, Website
    from app import db
    from datetime import datetime
    #Parse data from request
    data = request.get_json()
    website_id = data.get("website_id")
    alert_type = data.get("alert_type")

    #Ensure required fields provided
    if not website_id or not alert_type:
        return jsonify({"error": "Website ID and alert type required!"}), 400

    #Check if website exists and belongs to user
    website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()

    if not website:
        return jsonify({"error": "Website not found or unauthorized"}), 404

    #Create new alert
    new_alert = Alert(
        website_id=website.id,
        alert_type=alert_type,
        status="unresolved",
        timestamp=datetime.utcnow()
    )

    #Save alert to db
    db.session.add(new_alert)
    db.session.commit()

    return jsonify({
        "message": "Alert created successfully!",
        "alert": {
            "id": new_alert.id,
            "website_id": new_alert.website_id,
            "alert_type": new_alert.alert_type,
            "status": new_alert.status,
            "timestamp": new_alert.timestamp
        }
    }), 201

@alerts_bp.route('/', methods=['GET'])
@token_required
def get_alerts(current_user):
    from app.models import Alert, Website #Delayed import to avoid circular import
    #Get website_id from query parameters
    website_id = request.args.get("website_id", type=int)

    #Query user's websites
    user_websites = Website.query.filter_by(user_id=current_user.id).all()
    user_website_ids = {website.id for website in user_websites}

    #Validate website_id is provided
    if website_id and website_id not in user_website_ids:
        return jsonify({"error": "Website not found or unauthorized"}), 404

    #Query alerts based on ownership
    alerts_query = Alert.query.filter(Alert.website_id.in_(user_website_ids))

    if website_id:
        alerts_query = alerts_query.filter_by(website_id=website_id)

    alerts = alerts_query.all()

    #Serialize alerts
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
def update_alert(current_user, alert_id):
    from app.models import Alert #Delayed to avoid circular import
    from app import db
    #Find the alert by ID
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    #Get the new status from the request JSON
    data = request.get_json()
    
    #Update status if provided
    if "status" in data:
        alert.status = data["status"]
    
    #update alert_type if provided
    if "alert_type" in data:
        alert.alert_type = data["alert_type"]

    #Commit to db
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

#Resolve the alert
@alerts_bp.route('/resolve/<int:alert_id>', methods=['PUT'])
@token_required
def resolve_alert(current_user, alert_id):
    from app.models import Alert, Website
    from app import db

    #Find alert by ID
    alert = Alert.query.get(alert_id)

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    #Ensure user owns website associated to alert
    website = Website.query.get(alert.website_id)
    if not website or website.user_id != current_user.id:
        return jsonify({"error": "Unauthorized to resolve this alert"}), 403

    #Update alert status
    alert.status = "resolved"
    db.session.commit()

    return jsonify({
        "message": "Alert resolved successfully!",
        "alert": {
            "id": alert.id,
            "website_id": alert.website_id,
            "alert_type": alert.alert_type,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat(),
        }
    }), 200
