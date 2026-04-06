# 🌍 Real-Time Earth & Space Visualization System

An interactive 3D platform that visualizes real-time data from Earth and space — including live satellite positions, weather, climate, and near-Earth objects.

> ⚡ This is not a simulation — all data reflects real-world conditions at the current moment.

---

## 🚀 Live Demo

🔗 https://exploreourspace.vercel.app

---

## ✨ Features

- 🛰️ Real-time satellite tracking (TLE-based)
- 🌍 3D Earth with rotation synced to real-world time
- 🌦️ Weather and climate data visualization
- 🌬️ Wind direction and atmospheric data
- ☄️ Asteroid / space object tracking
- 🔍 Satellite search and filtering
- 📊 Click on satellites to view:
  - Altitude  
  - Speed  
  - Latitude & Longitude  
- 🌀 Orbit path visualization
- 🎮 Smooth interactive controls (zoom, pan, rotate)

---

## 🧠 How It Works

- Satellite positions are computed using **SGP4 propagation**
- TLE (Two-Line Element) data is used for real-time orbital calculations
- Positions are converted from:
  - ECI → Geodetic coordinates
- Earth rotation is synced with real-world UTC time
- Data layers are rendered dynamically on a 3D globe

---

## 🛠️ Tech Stack

- **Three.js** — 3D rendering
- **satellite.js** — orbital mechanics calculations
- **JavaScript (ES Modules)** — application logic
- **Vercel** — deployment

---

## ⚡ Performance Focus

- Optimized for smooth rendering on web browsers
- Lightweight rendering strategy for handling multiple satellites
- Efficient data updates for real-time visualization

---

## 📸 Preview

  https://exploreourspace.vercel.app

 

## 🚀 Future Improvements

- ☀️ Advanced lighting (day/night realism)
- 📡 More data layers (space weather, signals, etc.)
- 🛰️ Enhanced satellite models
- 📱 Further mobile optimization

---

## 📌 Key Highlight

> This system visualizes real-time Earth and space activity — not pre-recorded or simulated data.

---

## 🤝 Feedback

Open to suggestions, improvements, and ideas!

---

## 📜 License

MIT License
