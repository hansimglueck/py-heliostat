from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from models.models import db, Position, init_app, HeliostatOffset
from services.heliostat_state_service import HeliostatStateService
from services.solar_position_service import SolarPositionService
import sockets.pos_db_sockets as pos_db_sockets
import sockets.heliostat_state_sockets as heliostat_state_sockets
import sockets.solar_position_sockets as solar_position_sockets

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
init_app(app)
app.config["DEBUG"] = True
socketio = SocketIO(app)

# Heliostat initial position
# heliostat_direction = {'azimuth': 180, 'elevation': 45}

latitude, longitude = 52.7636, 13.6495  # Biesenthal coordinates
SolarPositionService.initialize(latitude, longitude, tz="Europe/Berlin")

pos_db_sockets.register_database_sockets(socketio)  # Initialisiere Socket.IO-Events
heliostat_state_sockets.register_heliostat_state_sockets(socketio)
solar_position_sockets.register_solar_position_sockets(socketio)


@app.route("/")
def index():
    positions = Position.query.all()
    offset = HeliostatOffset.get_singleton()
    return render_template(
        "index.html",
        heliostat_direction=HeliostatStateService.get_direction(),
        positions=positions,
        offset=offset
    )


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
