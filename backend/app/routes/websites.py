from flask import Blueprint, jsonify, request
from app.routes.auth import token_required


websites_bp = Blueprint('websites', __name__, url_prefix='/websites')


@websites_bp.route('/add', methods=['POST'])
@token_required
def add_website(current_user):
    from app.models import Website
    from app import db

    data = request.get_json()

    url = data.get('url')
    name = data.get('name')
    frequency = data.get('frequency', 5)

    #Validate Required Fields
    if not url or not name:
        return jsonify({"error": "Missing required fields"}), 400

    #create new Website object
    new_website = Website(user_id=current_user.id, url=url, name=name, frequency=frequency)

    #Add website to database session
    db.session.add(new_website)
    db.session.commit()

    return jsonify({
        "message": "Website added successfully!",
        "website": {
            "id": new_website.id,
            "user_id": new_website.user_id,
            "url": new_website.url,
            "name": new_website.name,
            "frequency": new_website.frequency
        }
    }), 201

@websites_bp.route('/', methods=['GET'])
@token_required
def get_websites(current_user):
    from app.models import Website

    #Query database for website belonging to user
    websites = Website.query.filter_by(user_id=current_user.id).all()

    #Serialize data into dictionary
    websites_data = [
        {
            "id": website.id,
            "url": website.url,
            "name": website.name,
            "frequency": website.frequency
        }
        for website in websites
    ]

    return jsonify(websites_data), 200

#Update Website
@websites_bp.route('/update', methods=['PUT'])
@token_required
def update_website(current_user):
    from app.models import Website
    from app import db

    #Parse incoming JSON from request body
    data = request.get_json()

    #Extract fields from request
    website_id = data.get("website_id")
    url = data.get("url")
    name = data.get("name")
    frequency = data.get("frequency")

    #Validate website_id is provided
    if not website_id:
        return jsonify({"error": "Website ID is required"}), 400

    #Query db to find matching website
    website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()

    #Update website attributes if they are provided
    if url:
        website.url = url
    if name:
        website.name = name
    if frequency:
        website.frequency = frequency

    #Commit changes to db
    db.session.commit()

    #Return message with updated website details
    return jsonify({
        "message": "Website updated successfully!",
        "website": {
            "id": website.id,
            "user_id": website.user_id,
            "url": website.url,
            "name": website.name,
            "frequency": website.frequency
        }
    }), 200

#Delete websites
@websites_bp.route('/delete', methods=['DELETE'])
@token_required
def delete_website(current_user):
    from app.models import Website, Metric, Alert
    from app import db

    #Parse data from request
    data = request.get_json()
    website_id = data.get("website_id")

    #Ensure website_id is provided
    if not website_id:
        return jsonify({"error": "Website ID is required"}), 400

    #Query db for website
    website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()

    #If website doesn't exist or user unauthorized, return error
    if not website:
        return jsonify({"error": "Website not found or unauthorized"}), 404

    #Remove website from db
    db.session.delete(website)
    db.session.commit()

    #Return success message
    return jsonify({"message": "Website deleted successfully!"}), 200
