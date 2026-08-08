# AeroVanguard - Luxury Aircraft Sales & Fleet Management Platform

A high-performance luxury aircraft sales landing page and fleet management system built with standard web technologies and a lightweight Python backend.

## 🚀 Features

- **Interactive Jet Fleet Catalog**: Browse luxury business jets with high-resolution imagery, specifications (range, speed, passenger capacity), and pricing.
- **Advanced Filtering & Search**: Filter aircraft by category (Super Midsize, Heavy Jet, Ultra Long Range) and search by model name.
- **Inquiry & Test Flight Booking**: Seamless modal interface allowing prospective buyers to submit inquiry forms and book test flights.
- **Backend API & Database Integration**: Built-in SQLite database storing aircraft inventory and user inquiries.
- **Vercel Ready**: Preconfigured for static web hosting and serverless deployment via `vercel.json`.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern Vanilla CSS3, JavaScript (ES6+)
- **Backend**: Python 3 (Custom HTTP Server with SQLite3 integration)
- **Database**: SQLite3 (`database.db`)
- **Deployment**: Vercel ready (`vercel.json`)

---

## 📁 Project Structure

```text
aircraft-sales-landing-page/
├── backend/
│   ├── server.py           # Python HTTP backend server
│   ├── check_db.py         # Database health check script
│   ├── test_server.py      # Automated backend API tests
│   ├── database.db         # SQLite database file (local only)
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── index.html          # Main HTML landing page
│   ├── style.css           # Custom design system & styles
│   ├── app.js              # Frontend UI logic & API integration
│   ├── assets/             # Aircraft images & visual media
│   └── .env.example        # Frontend environment configuration template
├── push_to_github.py       # GitHub REST API upload utility script
├── vercel.json             # Vercel deployment configuration
├── .gitignore              # Ignored files & sensitive data rules
└── README.md               # Project documentation
```

---

## 💻 Getting Started Locally

### Prerequisites

- Python 3.8+ installed on your system.

### 1. Running the Backend

```bash
cd backend
python server.py
```
The backend server will start on `http://localhost:8080`.

To verify database records and backend health:
```bash
python check_db.py
```

### 2. Launching the Frontend

Simply open `frontend/index.html` in your web browser, or serve it using any standard HTTP server (e.g. VS Code Live Server or `python -m http.server 3000` inside the `frontend` folder).

---

## 🌐 Deploying to Vercel

This repository includes a pre-configured `vercel.json` file. You can deploy the frontend directly using the Vercel CLI or by connecting this GitHub repository to Vercel:

```bash
vercel
```

---

## 🔒 Security Notice

Sensitive keys (`google-services.json`), local SQLite databases (`database.db`), and local `.env` files are excluded from git via `.gitignore` to prevent credential exposure. Please use `.env.example` as a template for environment configuration.

