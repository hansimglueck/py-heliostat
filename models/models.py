from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Position(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    solar_azimuth = db.Column(db.Float, nullable=False)
    solar_elevation = db.Column(db.Float, nullable=False)
    heliostat_azimuth = db.Column(db.Float, nullable=False)
    heliostat_elevation = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

def init_app(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
