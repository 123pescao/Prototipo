# Website Monitoring Alert System

## Overview
This is a simple **Website Monitoring Alert System** that allows users to track the uptime and response time of websites. The system notifies users when a website is down and provides real-time status updates.

## Features
- **User Authentication** (Register & Login)
- **Website Monitoring** (Track uptime & response time)
- **Alert System** (Email/SMS notifications for downtime)
- **Dashboard** (View real-time website status)
- **API Integration** (Webhook support for external notifications)

## Tech Stack
### **Frontend**
- React (TailwindCSS, ShadCN, Zustand)
- Axios (for API calls)
- Recharts (for graphs & reports)

### **Backend**
- Flask (Python-based API)
- SQLite (Database for storing websites & status logs)
- Flask-CORS (For handling cross-origin requests)
- Requests (For checking website status)
- APScheduler (For periodic website monitoring)

## Installation
### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/website-monitoring.git
cd website-monitoring
```

### **2. Setup Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### **3. Setup Frontend**
```bash
cd frontend
npm install
npm start
```

## Usage
- Open `http://localhost:3000` in your browser.
- Add websites to monitor.
- View their real-time status on the dashboard.
- Receive alerts when websites go down.

## Future Enhancements
- Multi-region monitoring
- AI-based anomaly detection
- Mobile app (React Native)
- Cloudflare integration



