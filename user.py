import numpy as np
import joblib
import requests as r
import math
import pandas as pd

class RiskDetector:
    def __new__(cls):
        pass #nothing yet but will add more things later if since they need to be connected
    def __init__(self, safe_lat:float,safe_long:float, river_lat:float, river_long:float):
        self.safe_lat=safe_lat
        self.safe_long = safe_long
        self.river_lat=river_lat
        self.river_long=river_long

    def distance(self, lat1,lat2,long1,long2):
        lat_diff = lat2-lat1
      longdiff=long2-long1
      a=math.sin(lat_diff/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin(longdiff/2)**2
      c=2*math.atan2(math.sqrt(a),math.sqrt(1-a))
      return c*6371

    def get_elevation(self):
        #one key detail to remember for now i have trained with the dataset elevation
        #which is the elevation from sea level while we are trying to get the elevation difference from 
        url = "https://api.open-meteo.com/v1/elevation"
            params = {"latitude": lat, "longitude": lon}
            try:
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data["elevation"]
            except Exception as e:
                print(f"Error fetching elevation for ({lat}, {lon}): {e}")
            return None
    #dont run this yet as it is incomplete
    def predict(self, lat:float,long:float,rainfall:np.ndarray,elevation:float,soil_moisture:float):
        model = joblib.load("risk_detector.pkl")
        dist=self.distance(lat,self.river_lat,long,self.river_long)
        # slope=elevation/dist
        # runoff_proxy=rainfall*(1+slope)
        data=pd.DataFrame({
            "Rainfall":[rainfall],
            "Elevation":[elevation],
            "distance":[dist],
            # "Slope":[slope],
            # "runoff_proxy":[runoff_proxy],
            "soil_moisture_0_to_7cm (m³/m³)":[soil_moisture]
        })
        risk=model.predict(data)
        return risk[0]
    def __del__(self):
        print("RiskDetector object deleted")
