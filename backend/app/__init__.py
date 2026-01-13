from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import os
from routes.auth import auth_bp
from routes.attacks import attacks_bp

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
    
    # Enable CORS for all routes
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(attacks_bp)
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Cyber Attack Dashboard API',
            'version': '2.0.0',
            'endpoints': {
                'authentication': {
                    'register': '/api/register',
                    'login': '/api/login',
                    'health': '/api/health'
                },
                'attacks_data': {
                    'get_all_attacks': '/api/attacks',
                    'get_summary': '/api/attacks/summary',
                    'filter_attacks': '/api/attacks/filter',
                    'get_filter_options': '/api/attacks/stats'
                }
            }
        }), 200
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500
    
    logger.info("Flask application created successfully")
    return app