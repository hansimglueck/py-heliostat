from flask_socketio import emit
from services.heliostat_state_service import HeliostatStateService
from models.models import db, HeliostatOffset


def register_heliostat_state_sockets(socketio):
    @socketio.on("change_direction")
    def handle_change_direction(message):
        # global heliostat_direction
        step = float(message["step"])  # Step size from the client
        print(step)
        if message["direction"] == "up":
            HeliostatStateService.adjust_elevation(step)
        elif message["direction"] == "down":
            HeliostatStateService.adjust_elevation(-step)
        elif message["direction"] == "left":
            HeliostatStateService.adjust_azimuth(-step)
        elif message["direction"] == "right":
            HeliostatStateService.adjust_azimuth(step)

        socketio.emit("update_heliostat", HeliostatStateService.get_direction())

    @socketio.on("update_offset")
    def handle_offset_update(data):
        offset = HeliostatOffset.get_singleton()
        if "azimuth_offset" in data:
            offset.azimuth_offset = data["azimuth_offset"]
        if "elevation_offset" in data:
            offset.elevation_offset = data["elevation_offset"]
        db.session.commit()
        socketio.emit(
            "update_response",
            {
                "azimuth_offset": offset.azimuth_offset,
                "elevation_offset": offset.elevation_offset,
            },
        )
