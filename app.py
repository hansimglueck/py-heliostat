from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from models import db, Position, init_app
from heliostat_state import HeliostatState
from solar_position import SolarPosition
import database_routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
init_app(app)
app.config['DEBUG'] = True
socketio = SocketIO(app)

# Heliostat initial position
# heliostat_direction = {'azimuth': 180, 'elevation': 45}

database_routes.setup_routes(socketio)  # Initialisiere Socket.IO-Events


latitude, longitude = 52.7636, 13.6495  # Biesenthal coordinates
SolarPosition.initialize(latitude, longitude, tz='Europe/Berlin')


@app.route('/')
def index():
    positions = Position.query.all()
    return render_template('index.html', heliostat_direction=HeliostatState.get_direction(), positions=positions)

@socketio.on('connect')
def on_connect():
    socketio.start_background_task(target=background_solar_position)

def background_solar_position():
    while True:
        emit_solar_position()
        socketio.sleep(10)  # Pause for 10 seconds

def emit_solar_position():
    position = SolarPosition.get_position()
    socketio.emit('solar_position', {'azimuth': position['azimuth'], 'elevation': position['elevation']})

@socketio.on('change_direction')
def handle_change_direction(message):
    global heliostat_direction
    step = float(message['step'])  # Step size from the client
    print(step)
    if message['direction'] == 'up':
        HeliostatState.adjust_elevation(step)
    elif message['direction'] == 'down':
        HeliostatState.adjust_elevation(-step)
    elif message['direction'] == 'left':
        HeliostatState.adjust_azimuth(-step)
    elif message['direction'] == 'right':
        HeliostatState.adjust_azimuth(step)
        
    socketio.emit('update_heliostat', HeliostatState.get_direction())




# def create_tables():
#     with app.app_context():
#         db.create_all()

if __name__ == '__main__':
    # create_tables()
    socketio.run(app, host='0.0.0.0', port=80)
