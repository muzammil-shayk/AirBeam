# 🚀 AirBeam | Fast, Free & Secure No-Login File Sharing

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AirBeam** is a high-performance, minimalist file-sharing platform designed for speed and security. Upload multiple files, get a unique shareable key or QR code, and let your recipients download everything as a single ZIP—**all without ever creating an account.**

---

## ✨ Key Features

- **⚡ No-Login Required**: Start sharing instantly. No email, no passwords, no friction.
- **📦 Multi-File Albums**: Upload up to 10 files (200MB total) and share them as a single collection.
- **📱 QR Code Sharing**: Integrated with **AirQR API** for seamless mobile-to-desktop transfers.
- **⏳ Real-Time Expiration**: Files are automatically deleted after 5 minutes for maximum privacy.
- **🔒 Secure Storage**: Powered by **MongoDB GridFS** for robust and scalable file handling.
- **🎨 Premium UI**: A sleek, responsive design with real-time countdown timers and delightful micro-animations.

---

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS (for sleek styling), Lucide Icons.
- **Backend**: Node.js, Express, Multer (multi-part handling).
- **Storage**: MongoDB GridFS (efficient large file storage).
- **Cleanup**: Node-cron (automated 5-minute ephemeral deletion logic).

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/muzammil-shayk/AirBeam.git
cd AirBeam
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
FRONTEND_URL=http://localhost:3000
```

### 3. Run Locally
```bash
# Start Backend
cd backend
npm run dev

# Start Frontend (Search for http://localhost:5173)
cd ../frontend
npm run dev
```

---

## 🔌 API Integration (AirQR)

AirBeam uses the **AirQR API** to generate high-resolution, black-and-white QR codes for every upload session. Want to use it in your own project?

```http
GET https://airqr.vercel.app/api/qr?data=https://airbeam.onrender.com/?key=YOUR_KEY
```

---

## 🛡️ Security & Privacy

Files uploaded to AirBeam are stored temporarily and are **permanently destroyed** from our servers 5 minutes after upload. We do not log user data or track file contents.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Created with ❤️ by the AirBeam Team.
