from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import pvlib
from datetime import datetime
from pytz import timezone

app = Flask(__name__)
app.config['DEBUG'] = True
socketio = SocketIO(app)

# Heliostat initial position
heliostat_direction = {'azimuth': 180, 'elevation': 45}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    socketio.start_background_task(target=background_solar_position)

def background_solar_position():
    while True:
        emit_solar_position()
        socketio.sleep(10)  # Pause for 10 seconds

def emit_solar_position():
    position = get_solar_position()
    socketio.emit('solar_position', {'azimuth': position['azimuth'], 'elevation': position['elevation']})

@socketio.on('change_direction')
def handle_change_direction(message):
    global heliostat_direction
    step = float(message['step'])  # Step size from the client
    if message['direction'] == 'up':
        heliostat_direction['elevation'] += step
    elif message['direction'] == 'down':
        heliostat_direction['elevation'] -= step
    elif message['direction'] == 'left':
        heliostat_direction['azimuth'] -= step
    elif message['direction'] == 'right':
        heliostat_direction['azimuth'] += step
    socketio.emit('update_heliostat', heliostat_direction)

def get_solar_position():
    latitude, longitude = 52.7636, 13.6495  # Biesenthal coordinates
    tz = timezone('Europe/Berlin')
    solpos = pvlib.solarposition.get_solarposition(datetime.now(tz), latitude, longitude)
    return solpos.iloc[0]

if __name__ == '__main__':
    socketio.run(app)
