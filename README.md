# 🇳🇵 Nepal Flood AI - Early Warning & Evacuation System

An AI-powered emergency flood early warning, dynamic evacuation routing, Google Maps shelter navigation, interactive flood visualizer, obstacle resolution, and citizen alert broadcast network tailored specifically for Nepal's flood-prone river basins (Koshi, Narayani, Bagmati, and Kathmandu Valley corridors).

---

## 🌟 Core Features

1. **DHM Hydrological Telemetry & AI Early Warning Predictor**:
   - Real-time monitoring of river water level against Warning Level and Danger Mark.
   - Upstream 24h rainfall (mm), river discharge (cusecs), Koshi Barrage sluice gates open, and rate of rise (cm/hr).
   - Inundation Threat Index (0–100%) and **Time to Flood Crest Arrival** ETA.

2. **Where to Go & How to Go (Safe Shelter Navigation)**:
   - High-risk settlements selector (e.g. Tilathi Lowland, Hanumannagar, Bhardaha, Madi, Gaur, Balkhu).
   - Verified high-ground safe havens with elevation (e.g. +15.3m above water line), capacity, and emergency facilities.
   - Step-by-step turn-by-turn walking instructions with distance and walk times.

3. **Google Maps Integration**:
   - 1-click **"Open in Google Maps"** walking navigation deep links.
   - On-screen **Mobile QR Code** generator: scan with any smartphone camera to open directions directly in the Google Maps mobile app.
   - **Voice Guidance**: Speech synthesis reading out navigation steps aloud.

4. **Interactive Flood Visualizer (SVG Vector Map)**:
   - Animated river currents and surface waves.
   - Expanding dynamic flood inundation layers (Deep submergence >1.5m, Moderate 0.5-1.2m, Warning catchment 0.2m).
   - Dynamic road network with real-time bridge submergence indicators.
   - Water level simulator scrubber and quick simulation buttons (+0.5m surge, +1.5m torrent, bridge washout).

5. **Dynamic Obstacle Resolution ("When the Flood is Hampering the Path")**:
   - Immediate **"PATH BLOCKED"** warning when water submerges low causeways/bridges.
   - AI Dynamic Rerouting recalculates the alternative safe route via the elevated Flood Protection Bund (reinforced levee running along high ground).
   - Actionable tactical survival advice: do not enter moving water, move to high ground, what to do if stranded (retreat to 2nd floor, signal rescue helicopters with orange/red cloth).
   - Direct Nepal Emergency Hotlines (1155 DHM Flood, 100 Police, 1114 APF Rescue, 1130 Red Cross).

6. **Nepal Citizen Registry & Dispatched Message Audit Log**:
   - Citizen directory with authentic Nepali names, wards, mobile numbers (+977 98...), and vulnerability tags (elderly, infants, pregnant, disabled, livestock).
   - Personalized bilingual AI message synthesizer (Nepali Devanagari & English) with custom Google Maps links.
   - Dispatched message audit trail tracking delivery status and citizen evacuation progress (Notified, En Route, Safely Reached Shelter, SOS Rescue Needed).
   - Mass Broadcast feature and 1-click CSV Log export (`nepal_flood_alert_dispatched_log.csv`).

---

## 🚀 How to Download and Run (Step-by-Step)

### Prerequisites
- **Node.js 18+** (or **Python 3.8+** for the standalone option)
- A modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox)

---

### Step 1: Download & Extract
1. In the app, click the **"📦 Download & Run"** button in the top navigation bar.
2. Click **"Download Code (.ZIP)"** to save `nepal-flood-ai.zip` to your computer.
3. Extract the `.zip` file:
   - **Windows**: Right-click `nepal-flood-ai.zip` > **Extract All...**
   - **Mac**: Double-click `nepal-flood-ai.zip`
   - **Linux**: Run `unzip nepal-flood-ai.zip -d nepal-flood-ai`

---

### Step 2: Open Terminal / Command Prompt
- **Windows**: Open the extracted folder, click the address bar, type `cmd`, and press Enter.
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter, and navigate to the folder (`cd ~/Downloads/nepal-flood-ai`).
- **Linux**: Open terminal and navigate to the folder (`cd nepal-flood-ai`).

---

### Step 3: Run the Development Server

#### Option A: Node.js (Vite)
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

#### Option B: Standalone Python (Zero Dependencies)
If you do not have Node.js installed, Python's built-in standard library can run the app:
```bash
python3 server.py 8000
# On Windows:
python server.py 8000
```

---

### Step 4: Open in Web Browser
Open your browser and navigate to:
```
http://localhost:3000
```
*(or `http://localhost:8000` if using the Python server)*

---

## 🛑 How to Stop the Server
In your terminal / Command Prompt window, press:
```bash
Ctrl + C
```
