from flask_socketio import emit
from models.models import db, Position
from sqlalchemy.exc import SQLAlchemyError
from services.heliostat_state_service import HeliostatStateService
from services.solar_position_service import SolarPositionService


def register_database_sockets(socketio):
    def fetch_and_store_data():
        try:
            # Beispiel für das Abrufen der Daten. Ersetze dies durch tatsächliches Abrufen der Daten.
            solar_data = SolarPositionService.get_position()
            heliostat_data = HeliostatStateService.get_direction()

            position = Position(
                solar_azimuth=solar_data["azimuth"],
                solar_elevation=solar_data["elevation"],
                heliostat_azimuth=heliostat_data["azimuth"],
                heliostat_elevation=heliostat_data["elevation"],
            )

            db.session.add(position)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Error storing data: {e}")
            return False

    @socketio.on("request_save_data")
    def handle_save_request():
        if fetch_and_store_data():
            load_positions()
            emit(
                "data_saved",
                {
                    "message": "Solar- und Heliostat-Daten erfolgreich zusammen gespeichert"
                },
            )
        else:
            emit("error", {"message": "Fehler beim Speichern der Daten"})

    # @socketio.on('request_save_data')
    # def handle_save_request():
    #     fetch_and_store_data()
    #     load_positions()
    #     socketio.emit('data_saved', {'message': 'Solar- und Heliostat-Daten erfolgreich zusammen gespeichert'})

    @socketio.on("load_positions")
    def load_positions():
        positions = Position.query.all()
        positions_data = [
            {
                "id": pos.id,
                "solar_azimuth": pos.solar_azimuth,
                "solar_elevation": pos.solar_elevation,
                "heliostat_azimuth": pos.heliostat_azimuth,
                "heliostat_elevation": pos.heliostat_elevation,
            }
            for pos in positions
        ]
        emit("positions_data", {"positions": positions_data})

    @socketio.on("delete_position")
    def delete_position(data):
        position = Position.query.get(data["id"])
        if position:
            db.session.delete(position)
            db.session.commit()
            emit("position_deleted", {"id": data["id"]}, broadcast=True)

    @socketio.on("delete_selected_positions")
    def delete_selected_positions(data):
        selected_ids = data["selected_ids"]
        for id in selected_ids:
            position = Position.query.get(id)
            if position:
                db.session.delete(position)
        db.session.commit()
        emit(
            "selected_positions_deleted", {"selected_ids": selected_ids}, broadcast=True
        )
