import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV
import joblib

if os.path.exists("hackathon") and os.path.isdir("hackathon"):
    os.chdir("hackathon")

df = pd.read_csv("flood.csv")
df2 = pd.read_csv("loaded.csv")
df["distance"] = df["distance"].replace(0, 0.0001)
df["Slope"] = df["Elevation"] / df["distance"]
df["Slope"] = df["Slope"].clip(lower=0.0001)
df["rain_3d_rolling"] = df["Rainfall"].rolling(window=3).sum()
df["rain_7d_rolling"] = df["Rainfall"].rolling(window=7).sum()
df["runoff_proxy"] = df["rain_3d_rolling"] * (1.0 + df["Slope"])
df = pd.merge(df,df2["soil_moisture_0_to_7cm (m³/m³)"],left_index=True,right_index=True,how="left",)
df.replace([np.inf, -np.inf], np.nan, inplace=True)
df = df.dropna()
cols_to_drop = [
    "Disaster Type",
    "time",
    "Total Deaths",
    "Total Affected",
    "Latitude",
    "Longitude",
    "occured",
    "duration"
]
df = df.drop(columns=cols_to_drop, errors="ignore")
rain_threshold = df["Rainfall"].quantile(0.90)
elev_threshold = df["Elevation"].quantile(0.25)
rain_threshold = df["Rainfall"].quantile(0.75) 
elev_threshold = df["Elevation"].quantile(0.40) 

flood_conditions = (
    (df["Rainfall"] >= rain_threshold) 
    | (df["Elevation"] <= elev_threshold) 
)
df["y"] = 0
df.loc[flood_conditions, "y"]=1
X=df.drop(columns=["y"])
y = df["y"]
print(y.value_counts())
cv = StratifiedKFold(n_splits=5,shuffle=True, random_state=42)
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier",RandomForestClassifier(n_estimators=100, random_state=42),
),
])
_pipeline = CalibratedClassifierCV(estimator=pipeline,
                                    method="isotonic",  cv=5  )
scoring = ["accuracy", "precision", "recall", "f1"]
cv_results = cross_validate(_pipeline, X, y, cv=cv, scoring=scoring, return_train_score=False)

print(f"Mean Accuracy: {cv_results['test_accuracy'].mean()} ({cv_results['test_accuracy'].std():.4f})")
print(f"Mean Precision: {cv_results['test_precision'].mean()} ({cv_results['test_precision'].std():.4f})")
print(
    f"mean recall:{cv_results['test_recall'].mean()} ({cv_results['test_recall'].std()})"
)
print(f"mean f1:{cv_results['test_f1'].mean()} ({cv_results['test_f1'].std()})")
joblib.dump(_pipeline, "risk_detector.pkl")
print(X.head(1))
