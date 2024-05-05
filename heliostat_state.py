# state_manager.py
class HeliostatState:
    direction = {'azimuth': 180, 'elevation': 45}

    @classmethod
    def get_direction(cls):
        return cls.direction

    @classmethod
    def set_direction(cls, azimuth, elevation):
        cls.direction['azimuth'] = azimuth
        cls.direction['elevation'] = elevation

    @classmethod
    def adjust_azimuth(cls, step):
        cls.direction['azimuth'] += step
        cls.direction['azimuth'] %= 360  # Stellt sicher, dass der Wert innerhalb von 0-359 bleibt

    @classmethod
    def adjust_elevation(cls, step):
        new_elevation = cls.direction['elevation'] + step
        # Hier kann eine Begrenzung eingeführt werden, z. B. zwischen 0 und 90 Grad
        if 0 <= new_elevation <= 90:
            cls.direction['elevation'] = new_elevation
