from services.heliostat_state_service import HeliostatStateService


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
