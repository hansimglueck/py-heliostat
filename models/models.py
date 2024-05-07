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


class HeliostatOffset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    azimuth_offset = db.Column(db.Float, nullable=False)
    elevation_offset = db.Column(db.Float, nullable=False)

    @staticmethod
    def get_singleton():
        return HeliostatOffset.query.first() or HeliostatOffset(
            azimuth_offset=0, elevation_offset=0
        )


def init_app(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
            # Stellt sicher, dass ein Singleton-Objekt vorhanden ist
        if not HeliostatOffset.get_singleton():
            initial = HeliostatOffset(azimuth_offset=0, elevation_offset=0)
            db.session.add(initial)
            db.session.commit()

