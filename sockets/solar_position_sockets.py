from services.solar_position_service import SolarPositionService


def register_solar_position_sockets(socketio):
    @socketio.on("connect")
    def on_connect():
        socketio.start_background_task(target=background_solar_position)

    def background_solar_position():
        while True:
            emit_solar_position()
            socketio.sleep(10)  # Pause for 10 seconds

    def emit_solar_position():
        position = SolarPositionService.get_position()
        socketio.emit(
            "solar_position",
            {"azimuth": position["azimuth"], "elevation": position["elevation"]},
        )
