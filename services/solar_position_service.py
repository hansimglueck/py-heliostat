# solar_position.py
from pvlib import solarposition
import pandas as pd
from datetime import datetime
from pytz import timezone


class SolarPositionService:
    latitude = None
    longitude = None
    tz = None

    @classmethod
    def initialize(cls, latitude, longitude, tz="UTC"):
        cls.latitude = latitude
        cls.longitude = longitude
        cls.tz = timezone(tz)

    @classmethod
    def get_position(cls):
        if cls.latitude is None or cls.longitude is None:
            raise ValueError("SolarPosition is not initialized.")
        times = pd.date_range(datetime.now(), periods=1, freq="1min", tz=cls.tz)
        solpos = solarposition.get_solarposition(times, cls.latitude, cls.longitude)
        return {
            "azimuth": solpos["azimuth"].iloc[0],
            "elevation": solpos["elevation"].iloc[0],
        }

    #    solpos = pvlib.solarposition.get_solarposition(datetime.now(self.tz), self.latitude, self.longitude)
