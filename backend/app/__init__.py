from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
<<<<<<< HEAD
    # Enable CORS with credentials support
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
=======
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
>>>>>>> 4ebda91af98a70c687679e59ca0d831b3d78bc79
    
    # Register blueprints
    from app.routes import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Handle errors
    @app.errorhandler(404)
    def not_found_error(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
<<<<<<< HEAD
    # Add a health check route
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200
    
    # Add a route for session-based auth
    @app.route('/api/user', methods=['GET'])
    def current_user_route():
        from flask import session, jsonify
        from app.models import User
        
        user_id = session.get('user_id')
        if not user_id:
            return jsonify(None), 401
            
        user = User.query.get(user_id)
        if not user:
            return jsonify(None), 401
            
        return jsonify(user.to_dict())
    
=======
>>>>>>> 4ebda91af98a70c687679e59ca0d831b3d78bc79
    return app

from app import models