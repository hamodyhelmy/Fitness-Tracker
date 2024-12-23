from flask import Flask
from flask_mail import Mail
from dotenv import load_dotenv
from flask_session import Session  # Import Session from flask-session
import os

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'hamody2005')  # Replace with a secure, random string

    # Load environment variables from .env file
    load_dotenv()

    # Session configuration
    app.config['SESSION_TYPE'] = os.getenv('SESSION_TYPE', 'filesystem')
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    Session(app)

    # Flask-Mail configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))  # Default to 587
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

    if not all([app.config['MAIL_SERVER'], app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD']]):
        raise ValueError("Missing one or more Flask-Mail configurations.")

    mail.init_app(app)

    # Register routes
    with app.app_context():
        from .routes import bp
        app.register_blueprint(bp, url_prefix='/')

    return app
